// FEATURE_RULES.md §3 — 미디어 파일 (media_attachments 테이블)
// Pre-signed URL 방식: 서버는 URL 발급만, 실제 파일은 S3로 직접 전송
import pool from '../config/db.js';

export const insertMedia = async (threadId, fileUrl, mediaType) => {
    const [result] = await pool.query(
        'INSERT INTO media_attachments (thread_id, file_url, media_type) VALUES (?, ?, ?)',
        [threadId, fileUrl, mediaType]
    );
    return result.insertId;
};

export const findMediaByThreadId = async (threadId) => {
    const [rows] = await pool.query(
        'SELECT id, file_url, media_type, created_at FROM media_attachments WHERE thread_id = ?',
        [threadId]
    );
    return rows;
};

export const deleteMediaByThreadId = async (threadId) => {
    await pool.query('DELETE FROM media_attachments WHERE thread_id = ?', [threadId]);
};
