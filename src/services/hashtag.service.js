// FEATURE_RULES.md §2 — 해시태그 추출 및 정규화
// 백엔드에서 content를 저장 직전에 정규식으로 추출 (프론트 전달 X)
import * as HashtagModel from '../models/hashtag.model.js';

const HASHTAG_REGEX = /(?<=#)[^\s#]+/g;

// content 문자열에서 해시태그 추출 → 소문자 정규화 → DB 저장 → thread에 연결
export const extractAndSaveTags = async (threadId, content) => {
    const matches = content.match(HASHTAG_REGEX) ?? [];
    if (!matches.length) return;

    const tagIds = await Promise.all(
        matches.map(tag => HashtagModel.findOrCreateTag(tag))
    );

    await HashtagModel.linkTagsToThread(threadId, tagIds);
    await HashtagModel.incrementUsageCount(tagIds);
};

// ASYNC_UPDATES.md: Polling 대상 — 1분~5분 주기 트렌딩 해시태그
export const getTrendingTags = async (limit = 20) => {
    return HashtagModel.findTrendingTags(limit);
};

export const getThreadsByTag = async (tagName) => {
    const tag = await HashtagModel.findTagByName(tagName);
    if (!tag) throw Object.assign(new Error('존재하지 않는 태그입니다.'), { status: 404 });
    return tag;
};
