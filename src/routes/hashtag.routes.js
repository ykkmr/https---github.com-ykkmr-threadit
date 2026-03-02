import { Router } from 'express';
import { getTrending, getByTag } from '../controllers/hashtag.controller.js';

const router = Router();

// GET /api/v1/hashtags/trending — Polling 대상 (1분~5분 주기)
router.get('/trending', getTrending);

// GET /api/v1/hashtags/:name — 특정 태그의 스레드 목록
router.get('/:name', getByTag);

export default router;
