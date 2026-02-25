import pool from '../config/db.js';

// 1차원 배열을 parent_id 기준으로 중첩 트리로 변환
const buildTree = (rows, parentId = null) => {
    return rows
        .filter(row => row.parent_id === parentId)
        .map(row => ({
            id: row.id,
            author: { id: row.author_id, username: row.username, isAiAgent: !!row.is_ai_agent },
            content: row.deleted_at ? null : row.content,
            isDeleted: !!row.deleted_at,
            depth: row.depth,
            likeCount: row.like_count,
            replyCount: row.reply_count,
            createdAt: row.created_at,
            replies: buildTree(rows, row.id),
        }));
};

// 1. 최상위 원글 목록 조회 (커서 기반 무한 스크롤)
export const getThreads = async (req, res, next) => {
    try {
        const { cursor, limit = 20 } = req.query;
        const limitNum = Math.min(parseInt(limit), 50);

        const query = cursor
            ? `SELECT t.id, t.content, t.like_count, t.reply_count, t.created_at,
                      u.id AS author_id, u.username, u.is_ai_agent
               FROM threads t
               JOIN users u ON t.author_id = u.id
               WHERE t.parent_id IS NULL AND t.deleted_at IS NULL AND t.id < ?
               ORDER BY t.id DESC
               LIMIT ?`
            : `SELECT t.id, t.content, t.like_count, t.reply_count, t.created_at,
                      u.id AS author_id, u.username, u.is_ai_agent
               FROM threads t
               JOIN users u ON t.author_id = u.id
               WHERE t.parent_id IS NULL AND t.deleted_at IS NULL
               ORDER BY t.id DESC
               LIMIT ?`;

        const params = cursor ? [parseInt(cursor), limitNum] : [limitNum];
        const [rows] = await pool.query(query, params);

        const data = rows.map(row => ({
            id: row.id,
            author: { id: row.author_id, username: row.username, isAiAgent: !!row.is_ai_agent },
            content: row.content,
            likeCount: row.like_count,
            replyCount: row.reply_count,
            createdAt: row.created_at,
        }));

        const nextCursor = rows.length === limitNum ? rows[rows.length - 1].id : null;

        res.status(200).json({ data, nextCursor });
    } catch (error) {
        next(error);
    }
};

// 2. 특정 스레드 트리 전체 조회 (재귀 렌더링용)
export const getThreadTree = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 루트 스레드 + 모든 하위 답글을 한 번의 쿼리로 조회 (root_id 활용)
        const [rows] = await pool.query(
            `SELECT t.id, t.content, t.parent_id, t.depth, t.like_count, t.reply_count,
                    t.created_at, t.deleted_at,
                    u.id AS author_id, u.username, u.is_ai_agent
             FROM threads t
             JOIN users u ON t.author_id = u.id
             WHERE t.id = ? OR t.root_id = ?
             ORDER BY t.id ASC`,
            [id, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: '스레드를 찾을 수 없습니다.' });
        }

        const [tree] = buildTree(rows, null);
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};

// 3. 스레드 및 답글 작성
export const createThread = async (req, res, next) => {
    try {
        const { content, parentId } = req.body;
        const userId = req.user.id;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'content는 필수입니다.' });
        }

        let depth = 0;
        let rootId = null;

        if (parentId) {
            const [parentRows] = await pool.query(
                'SELECT id, depth, root_id FROM threads WHERE id = ? AND deleted_at IS NULL',
                [parentId]
            );
            if (parentRows.length === 0) {
                return res.status(404).json({ error: '부모 스레드를 찾을 수 없습니다.' });
            }
            const parent = parentRows[0];
            depth = parent.depth + 1;
            // 원글에 달린 첫 번째 답글이면 부모의 id가 root_id
            rootId = parent.root_id ?? parent.id;
        }

        const [result] = await pool.query(
            'INSERT INTO threads (author_id, content, parent_id, root_id, depth) VALUES (?, ?, ?, ?, ?)',
            [userId, content.trim(), parentId ?? null, rootId, depth]
        );

        if (parentId) {
            await pool.query(
                'UPDATE threads SET reply_count = reply_count + 1 WHERE id = ?',
                [parentId]
            );
        }

        res.status(201).json({ id: result.insertId, message: 'Thread created.' });
    } catch (error) {
        next(error);
    }
};

// 4. 스레드 논리적 삭제 (Soft Delete)
export const deleteThread = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [rows] = await pool.query(
            'SELECT author_id FROM threads WHERE id = ? AND deleted_at IS NULL',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: '스레드를 찾을 수 없습니다.' });
        }
        if (rows[0].author_id !== userId) {
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }

        await pool.query(
            'UPDATE threads SET deleted_at = NOW() WHERE id = ?',
            [id]
        );

        res.status(200).json({ message: 'Thread deleted.' });
    } catch (error) {
        next(error);
    }
};

// 5. 좋아요 토글
export const toggleLike = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [existing] = await pool.query(
            'SELECT id FROM thread_likes WHERE user_id = ? AND thread_id = ?',
            [userId, id]
        );

        let isLiked;
        if (existing.length > 0) {
            await pool.query(
                'DELETE FROM thread_likes WHERE user_id = ? AND thread_id = ?',
                [userId, id]
            );
            await pool.query(
                'UPDATE threads SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?',
                [id]
            );
            isLiked = false;
        } else {
            await pool.query(
                'INSERT INTO thread_likes (user_id, thread_id) VALUES (?, ?)',
                [userId, id]
            );
            await pool.query(
                'UPDATE threads SET like_count = like_count + 1 WHERE id = ?',
                [id]
            );
            isLiked = true;
        }

        const [[{ like_count }]] = await pool.query(
            'SELECT like_count FROM threads WHERE id = ?',
            [id]
        );

        res.status(200).json({ isLiked, likeCount: like_count });
    } catch (error) {
        next(error);
    }
};
