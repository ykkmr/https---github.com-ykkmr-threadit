import { Router } from 'express';
import { getPresignedUrl, saveMedia } from '../controllers/media.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/v1/media/presign — Pre-signed URL 발급 (인증 필요)
router.post('/presign', authenticate, getPresignedUrl);

// POST /api/v1/media — 업로드 완료 후 CDN URL DB 기록 (인증 필요)
router.post('/', authenticate, saveMedia);

export default router;
