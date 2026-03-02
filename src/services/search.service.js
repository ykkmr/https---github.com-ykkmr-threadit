// FEATURE_RULES.md §1 — 검색 서비스
// Full-Text Search (MySQL FULLTEXT INDEX) 사용, LIKE '%keyword%' 금지
import * as SearchModel from '../models/search.model.js';

const MIN_KEYWORD_LENGTH = 2;
const MAX_KEYWORD_LENGTH = 50;

export const searchAll = async (keyword, cursor, limit = 20) => {
    if (!keyword || keyword.length < MIN_KEYWORD_LENGTH) {
        throw Object.assign(new Error(`검색어는 최소 ${MIN_KEYWORD_LENGTH}자 이상이어야 합니다.`), { status: 400 });
    }
    if (keyword.length > MAX_KEYWORD_LENGTH) {
        throw Object.assign(new Error(`검색어는 최대 ${MAX_KEYWORD_LENGTH}자까지 허용됩니다.`), { status: 400 });
    }

    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const [threads, users] = await Promise.all([
        SearchModel.searchThreads(keyword, cursor, limitNum),
        SearchModel.searchUsers(keyword, 5),
    ]);

    const nextCursor = threads.length === limitNum ? threads[threads.length - 1].id : null;
    return { threads, users, nextCursor };
};
