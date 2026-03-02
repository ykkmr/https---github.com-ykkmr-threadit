import * as ThreadModel from '../models/thread.model.js';

const buildTree = (rows, parentId = null) => {
    return rows
        .filter(row => row.parent_id === parentId)
        .map(row => ({
            id: row.id,
            author: { id: row.author_id, username: row.username, isAiAgent: !!row.is_ai_agent },
            content: row.deleted_at ? null : row.content,
            mediaUrl: row.deleted_at ? null : (row.media_url ?? null),
            isDeleted: !!row.deleted_at,
            depth: row.depth,
            likeCount: row.like_count,
            replyCount: row.reply_count,
            createdAt: row.created_at,
            replies: buildTree(rows, row.id),
        }));
};

export const getRootThreads = async (cursor, limit = 20) => {
    const limitNum = Math.min(parseInt(limit), 50);
    const rows = await ThreadModel.findRootThreads(cursor, limitNum);

    const data = rows.map(row => ({
        id: row.id,
        author: { id: row.author_id, username: row.username, isAiAgent: !!row.is_ai_agent },
        content: row.content,
        mediaUrl: row.media_url ?? null,
        likeCount: row.like_count,
        replyCount: row.reply_count,
        createdAt: row.created_at,
    }));

    const nextCursor = rows.length === limitNum ? rows[rows.length - 1].id : null;
    return { data, nextCursor };
};

export const getThreadTree = async (id) => {
    const rows = await ThreadModel.findThreadTree(id);
    if (rows.length === 0) return null;

    const [tree] = buildTree(rows, null);
    return tree;
};

export const createThread = async (userId, content, parentId, mediaUrl) => {
    if (!content || content.trim() === '') {
        throw Object.assign(new Error('content는 필수입니다.'), { status: 400 });
    }

    let depth = 0;
    let rootId = null;

    if (parentId) {
        const parent = await ThreadModel.findThreadById(parentId);
        if (!parent) {
            throw Object.assign(new Error('부모 스레드를 찾을 수 없습니다.'), { status: 404 });
        }
        depth = parent.depth + 1;
        rootId = parent.root_id ?? parent.id;
    }

    const insertedId = await ThreadModel.insertThread(userId, content.trim(), mediaUrl ?? null, parentId ?? null, rootId, depth);

    if (parentId) {
        await ThreadModel.incrementReplyCount(parentId);
    }

    return insertedId;
};

export const deleteThread = async (id, userId) => {
    const thread = await ThreadModel.findThreadById(id);
    if (!thread) {
        throw Object.assign(new Error('스레드를 찾을 수 없습니다.'), { status: 404 });
    }
    if (thread.author_id !== userId) {
        throw Object.assign(new Error('삭제 권한이 없습니다.'), { status: 403 });
    }
    await ThreadModel.softDeleteThread(id);
};

export const toggleLike = async (threadId, userId) => {
    const existing = await ThreadModel.findLike(userId, threadId);

    if (existing) {
        await ThreadModel.deleteLike(userId, threadId);
        const likeCount = await ThreadModel.getLikeCount(threadId);
        return { isLiked: false, likeCount };
    } else {
        await ThreadModel.insertLike(userId, threadId);
        const likeCount = await ThreadModel.getLikeCount(threadId);
        return { isLiked: true, likeCount };
    }
};
