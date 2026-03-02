// PERIPHERAL_FEATURES.md §3 — 방명록 (guestbooks 테이블)
// Depth 제한: 원글 1개 + 주인장 답글 1개 (1 Depth Flat 구조)
import pool from '../config/db.js';

export const findGuestbookEntries = async (profileUserId, viewerId) => {
    // 비밀글은 작성자 또는 프로필 주인만 조회 가능
    const [rows] = await pool.query(
        `SELECT g.id, g.content, g.is_secret, g.parent_id, g.created_at,
                u.id AS writer_id, u.username
         FROM guestbooks g
         JOIN users u ON g.writer_id = u.id
         WHERE g.profile_user_id = ?
           AND (g.is_secret = false OR g.writer_id = ? OR ? = ?)
         ORDER BY g.created_at DESC`,
        [profileUserId, viewerId, viewerId, profileUserId]
    );
    return rows;
};

export const insertGuestbook = async (profileUserId, writerId, content, parentId, isSecret) => {
    const [result] = await pool.query(
        'INSERT INTO guestbooks (profile_user_id, writer_id, content, parent_id, is_secret) VALUES (?, ?, ?, ?, ?)',
        [profileUserId, writerId, content, parentId ?? null, isSecret ?? false]
    );
    return result.insertId;
};

export const findGuestbookById = async (id) => {
    const [rows] = await pool.query(
        'SELECT id, profile_user_id, writer_id, parent_id FROM guestbooks WHERE id = ?',
        [id]
    );
    return rows[0] ?? null;
};

export const deleteGuestbook = async (id) => {
    await pool.query('DELETE FROM guestbooks WHERE id = ?', [id]);
};
