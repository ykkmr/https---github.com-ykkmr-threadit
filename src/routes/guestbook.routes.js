import { Router } from 'express';
import { getGuestbook, writeGuestbook, deleteGuestbook } from '../controllers/guestbook.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// PERIPHERAL_FEATURES.md: Rate Limit — 1분 3회 제한 (express-rate-limit 미들웨어 적용 예정)

// GET /api/v1/users/:userId/guestbook — 방명록 조회 (비밀글 필터링 포함)
router.get('/:userId/guestbook', optionalAuthenticate, getGuestbook);

// POST /api/v1/users/:userId/guestbook — 방명록 작성 (인증 필요)
router.post('/:userId/guestbook', authenticate, writeGuestbook);

// DELETE /api/v1/users/guestbook/:id — 방명록 삭제
router.delete('/guestbook/:id', authenticate, deleteGuestbook);

export default router;
