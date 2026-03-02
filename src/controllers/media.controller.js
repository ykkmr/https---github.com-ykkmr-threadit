import * as MediaService from '../services/media.service.js';

// Pre-signed URL 발급 (프론트가 S3에 직접 업로드 후 CDN URL 저장)
export const getPresignedUrl = async (req, res, next) => {
    try {
        const { mimeType, fileSize } = req.body;
        const result = await MediaService.validateAndGetPresignedUrl(mimeType, fileSize);
        res.status(200).json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};

// S3 업로드 완료 후 CDN URL을 DB에 기록
export const saveMedia = async (req, res, next) => {
    try {
        const { threadId, cdnUrl, mediaType } = req.body;
        const id = await MediaService.saveMediaRecord(threadId, cdnUrl, mediaType);
        res.status(201).json({ id, message: 'Media saved.' });
    } catch (error) {
        next(error);
    }
};
