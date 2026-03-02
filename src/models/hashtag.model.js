// FEATURE_RULES.md §2 — 해시태그 M:N 관계
// 테이블: tags (태그 사전), thread_tags (매핑)
import pool from '../config/db.js';

export const findOrCreateTag = async (name) => {
    // 소문자 정규화 후 upsert
    const [rows] = await pool.query(
        'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
        [name.toLowerCase()]
    );
    return rows.insertId;
};

export const linkTagsToThread = async (threadId, tagIds) => {
    if (!tagIds.length) return;
    const values = tagIds.map(tagId => [threadId, tagId]);
    await pool.query(
        'INSERT IGNORE INTO thread_tags (thread_id, tag_id) VALUES ?',
        [values]
    );
};

export const incrementUsageCount = async (tagIds) => {
    if (!tagIds.length) return;
    await pool.query(
        `UPDATE tags SET usage_count = usage_count + 1 WHERE id IN (${tagIds.map(() => '?').join(',')})`,
        tagIds
    );
};

export const findTrendingTags = async (limit = 20) => {
    const [rows] = await pool.query(
        'SELECT id, name, usage_count FROM tags ORDER BY usage_count DESC LIMIT ?',
        [limit]
    );
    return rows;
};

export const findTagByName = async (name) => {
    const [rows] = await pool.query(
        'SELECT id, name, usage_count FROM tags WHERE name = ?',
        [name.toLowerCase()]
    );
    return rows[0] ?? null;
};
