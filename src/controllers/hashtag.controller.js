import * as HashtagService from '../services/hashtag.service.js';

// 트렌딩 태그 목록 (ASYNC_UPDATES.md: Polling 대상 — 1분~5분 주기)
export const getTrending = async (req, res, next) => {
    try {
        const tags = await HashtagService.getTrendingTags();
        res.status(200).json({ data: tags });
    } catch (error) {
        next(error);
    }
};

// 특정 해시태그의 스레드 목록
export const getByTag = async (req, res, next) => {
    try {
        const tag = await HashtagService.getThreadsByTag(req.params.name);
        res.status(200).json(tag);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};
