import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const SALT_ROUNDS = 10;

export const registerUser = async (username, email, password) => {
    if (!username || !email || !password) {
        throw Object.assign(new Error('username, email, password는 필수입니다.'), { status: 400 });
    }

    const existing = await UserModel.findByEmailOrUsername(email, username);
    if (existing) {
        throw Object.assign(new Error('이미 사용 중인 이메일 또는 닉네임입니다.'), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await UserModel.insertUser(username, email, passwordHash);
};

export const loginUser = async (email, password) => {
    if (!email || !password) {
        throw Object.assign(new Error('email과 password는 필수입니다.'), { status: 400 });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw Object.assign(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'), { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw Object.assign(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'), { status: 401 });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return token;
};
