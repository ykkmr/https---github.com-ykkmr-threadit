import pool from '../config/db.js';

export const findRootThreads = async (cursor, limit) => {
    const query = cursor
        ? `SELECT t.id, t.content, t.media_url, t.like_count, t.reply_count, t.created_at,
                  u.id AS author_id, u.username, u.is_ai_agent
           FROM threads t
           JOIN users u ON t.author_id = u.id
           WHERE t.parent_id IS NULL AND t.deleted_at IS NULL AND t.id < ?
           ORDER BY t.id DESC
           LIMIT ?`
        : `SELECT t.id, t.content, t.media_url, t.like_count, t.reply_count, t.created_at,
                  u.id AS author_id, u.username, u.is_ai_agent
           FROM threads t
           JOIN users u ON t.author_id = u.id
           WHERE t.parent_id IS NULL AND t.deleted_at IS NULL
           ORDER BY t.id DESC
           LIMIT ?`;

    const params = cursor ? [parseInt(cursor), limit] : [limit];
    const [rows] = await pool.query(query, params);
    return rows;
};

export const findThreadTree = async (id) => {
    const [rows] = await pool.query(
        `SELECT t.id, t.content, t.media_url, t.parent_id, t.depth, t.like_count, t.reply_count,
                t.created_at, t.deleted_at,
                u.id AS author_id, u.username, u.is_ai_agent
         FROM threads t
         JOIN users u ON t.author_id = u.id
         WHERE t.id = ? OR t.root_id = ?
         ORDER BY t.id ASC`,
        [id, id]
    );
    return rows;
};

export const findThreadById = async (id) => {
    const [rows] = await pool.query(
        'SELECT id, author_id, depth, root_id FROM threads WHERE id = ? AND deleted_at IS NULL',
        [id]
    );
    return rows[0] ?? null;
};

export const insertThread = async (authorId, content, mediaUrl, parentId, rootId, depth) => {
    const [result] = await pool.query(
        'INSERT INTO threads (author_id, content, media_url, parent_id, root_id, depth) VALUES (?, ?, ?, ?, ?, ?)',
        [authorId, content, mediaUrl ?? null, parentId ?? null, rootId, depth]
    );
    return result.insertId;
};

export const softDeleteThread = async (id) => {
    await pool.query('UPDATE threads SET deleted_at = NOW() WHERE id = ?', [id]);
};

export const incrementReplyCount = async (id) => {
    await pool.query('UPDATE threads SET reply_count = reply_count + 1 WHERE id = ?', [id]);
};

export const findLike = async (userId, threadId) => {
    const [rows] = await pool.query(
        'SELECT id FROM thread_likes WHERE user_id = ? AND thread_id = ?',
        [userId, threadId]
    );
    return rows[0] ?? null;
};

export const insertLike = async (userId, threadId) => {
    await pool.query('INSERT INTO thread_likes (user_id, thread_id) VALUES (?, ?)', [userId, threadId]);
    await pool.query('UPDATE threads SET like_count = like_count + 1 WHERE id = ?', [threadId]);
};

export const deleteLike = async (userId, threadId) => {
    await pool.query('DELETE FROM thread_likes WHERE user_id = ? AND thread_id = ?', [userId, threadId]);
    await pool.query('UPDATE threads SET like_count = GREATEST(like_count - 1, 0) WHERE id = ?', [threadId]);
};

export const getLikeCount = async (id) => {
    const [[row]] = await pool.query('SELECT like_count FROM threads WHERE id = ?', [id]);
    return row.like_count;
};
