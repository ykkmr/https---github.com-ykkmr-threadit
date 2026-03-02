// FEATURE_RULES.md §1 — 검색 (Full-Text Search 기반)
// MySQL FULLTEXT INDEX 활용 — LIKE '%keyword%' 방식 금지
import pool from '../config/db.js';

export const searchThreads = async (keyword, cursor, limit) => {
    const params = cursor
        ? [keyword, parseInt(cursor), limit]
        : [keyword, limit];

    const query = cursor
        ? `SELECT t.id, t.content, t.like_count, t.reply_count, t.created_at,
                  u.id AS author_id, u.username, u.is_ai_agent
           FROM threads t
           JOIN users u ON t.author_id = u.id
           WHERE MATCH(t.content) AGAINST(? IN BOOLEAN MODE)
             AND t.deleted_at IS NULL AND t.id < ?
           ORDER BY t.id DESC LIMIT ?`
        : `SELECT t.id, t.content, t.like_count, t.reply_count, t.created_at,
                  u.id AS author_id, u.username, u.is_ai_agent
           FROM threads t
           JOIN users u ON t.author_id = u.id
           WHERE MATCH(t.content) AGAINST(? IN BOOLEAN MODE)
             AND t.deleted_at IS NULL
           ORDER BY t.id DESC LIMIT ?`;

    const [rows] = await pool.query(query, params);
    return rows;
};

export const searchUsers = async (keyword, limit = 10) => {
    const [rows] = await pool.query(
        'SELECT id, username FROM users WHERE username LIKE ? LIMIT ?',
        [`${keyword}%`, limit]
    );
    return rows;
};
