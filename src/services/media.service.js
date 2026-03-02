// FEATURE_RULES.md §3 — 미디어 파일 업로드 (Pre-signed URL 방식)
// 서버는 S3 Pre-signed URL 발급만 담당 — 파일을 직접 받지 않음
import { randomUUID } from 'crypto';
import * as MediaModel from '../models/media.model.js';

// CONTENT_AND_FILE_RULES.md: 파일명 = UUID + 타임스탬프 조합 (예: f8a1d-20260302.webp)
const generateStorageKey = (originalExt) => {
    const uuid = randomUUID().split('-')[0]; // 짧은 UUID 앞 8자리
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${uuid}-${timestamp}.${originalExt}`;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

export const validateAndGetPresignedUrl = async (mimeType, fileSize) => {
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);

    if (!isImage && !isVideo) {
        throw Object.assign(new Error('허용되지 않는 파일 형식입니다.'), { status: 400 });
    }
    if (isImage && fileSize > MAX_IMAGE_SIZE) {
        throw Object.assign(new Error('이미지는 최대 5MB까지 허용됩니다.'), { status: 400 });
    }
    if (isVideo && fileSize > MAX_VIDEO_SIZE) {
        throw Object.assign(new Error('동영상은 최대 50MB까지 허용됩니다.'), { status: 400 });
    }

    const ext = mimeType.split('/')[1];
    const storageKey = generateStorageKey(ext);
    const mediaType = isImage ? 'IMAGE' : 'VIDEO';

    // TODO: AWS S3 / Cloudflare R2 SDK로 Pre-signed URL 발급
    // const presignedUrl = await s3.getSignedUrlPromise('putObject', { Bucket, Key: storageKey, ... })
    // CDN URL은 S3 직접 URL이 아닌 CloudFront 도메인 사용
    const cdnUrl = `https://cdn.threadit.app/${storageKey}`;

    return { presignedUrl: '/* S3 presigned URL */', cdnUrl, storageKey, mediaType };
};

export const saveMediaRecord = async (threadId, cdnUrl, mediaType) => {
    return MediaModel.insertMedia(threadId, cdnUrl, mediaType);
};
