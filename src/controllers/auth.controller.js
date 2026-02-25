import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const SALT_ROUNDS = 10;

// 1. 유저 회원가입
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email, password는 필수입니다.' });
        }

        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: '이미 사용 중인 이메일 또는 닉네임입니다.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        next(error);
    }
};

// 2. 로그인 (JWT 토큰 발급)
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email과 password는 필수입니다.' });
        }

        const [rows] = await pool.query(
            'SELECT id, username, password_hash FROM users WHERE email = ?',
            [email]
        );
        const user = rows[0];
        if (!user) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};
