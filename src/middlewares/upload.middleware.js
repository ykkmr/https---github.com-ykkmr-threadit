import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm',
];

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // CONTENT_AND_FILE_RULES.md: UUID + 타임스탬프 파일명
        const uuid = randomUUID().split('-')[0];
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuid}-${timestamp}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('허용되지 않는 파일 형식입니다.'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB (이미지/동영상 중 큰 쪽 기준)
    },
});
