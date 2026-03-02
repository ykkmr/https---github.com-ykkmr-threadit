const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/v1/media/upload — multer가 파일을 uploads/ 에 저장 후 호출
export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '파일이 없습니다.' });
        }

        const isImage = ALLOWED_IMAGE.includes(req.file.mimetype);

        // 이미지 용량 2차 검증 (multer는 50MB 전체 제한, 이미지는 5MB)
        if (isImage && req.file.size > MAX_IMAGE_SIZE) {
            return res.status(400).json({ error: '이미지는 최대 5MB까지 허용됩니다.' });
        }

        const mediaType = isImage ? 'IMAGE' : 'VIDEO';
        const fileUrl = `/uploads/${req.file.filename}`;

        res.status(201).json({ fileUrl, mediaType, filename: req.file.filename });
    } catch (error) {
        next(error);
    }
};
