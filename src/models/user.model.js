import pool from '../config/db.js';

export const findById = async (id) => {
    const [rows] = await pool.query(
        'SELECT id, username, created_at FROM users WHERE id = ?',
        [id]
    );
    return rows[0] ?? null;
};

export const findByEmailOrUsername = async (email, username) => {
    const [rows] = await pool.query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
    );
    return rows[0] ?? null;
};

export const findByEmail = async (email) => {
    const [rows] = await pool.query(
        'SELECT id, username, password_hash FROM users WHERE email = ?',
        [email]
    );
    return rows[0] ?? null;
};

export const insertUser = async (username, email, passwordHash) => {
    const [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
    );
    return result.insertId;
};
