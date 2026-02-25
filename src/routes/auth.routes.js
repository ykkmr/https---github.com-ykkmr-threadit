import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = Router();

// 유저 회원가입
router.post('/register', register);

// 로그인 (JWT 토큰 발급)
router.post('/login', login);

export default router;
