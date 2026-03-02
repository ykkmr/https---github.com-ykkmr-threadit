import { Router } from 'express';
import { uploadFile } from '../controllers/media.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// POST /api/v1/media/upload — 파일 직접 업로드 (multer)
// 프론트에서 FormData로 전송: { file: File }
router.post('/upload', authenticate, upload.single('file'), uploadFile);

export default router;
