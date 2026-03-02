// PERIPHERAL_FEATURES.md §3 — 방명록 비즈니스 로직
// 구조 제한: 1 Depth (원글 + 주인장 답글만 허용)
import * as GuestbookModel from '../models/guestbook.model.js';

export const getGuestbook = async (profileUserId, viewerId) => {
    const entries = await GuestbookModel.findGuestbookEntries(profileUserId, viewerId ?? 0);

    // 1 Depth Flat → 원글 + replies 구조로 변환
    const roots = entries.filter(e => !e.parent_id);
    const replies = entries.filter(e => e.parent_id);

    return roots.map(root => ({
        ...root,
        reply: replies.find(r => r.parent_id === root.id) ?? null,
    }));
};

export const writeGuestbook = async (profileUserId, writerId, content, parentId, isSecret) => {
    if (!content?.trim()) {
        throw Object.assign(new Error('내용은 필수입니다.'), { status: 400 });
    }

    // Depth 1 제한: parentId가 있으면 해당 글의 parent_id가 null인지 확인
    if (parentId) {
        const parent = await GuestbookModel.findGuestbookById(parentId);
        if (!parent) throw Object.assign(new Error('존재하지 않는 방명록입니다.'), { status: 404 });
        if (parent.parent_id !== null) {
            throw Object.assign(new Error('방명록은 1 Depth까지만 허용됩니다.'), { status: 400 });
        }
        // 답글은 프로필 주인만 작성 가능
        if (parent.profile_user_id !== writerId) {
            throw Object.assign(new Error('답글은 프로필 주인만 작성할 수 있습니다.'), { status: 403 });
        }
    }

    return GuestbookModel.insertGuestbook(profileUserId, writerId, content.trim(), parentId, isSecret);
};

export const removeGuestbook = async (id, requesterId) => {
    const entry = await GuestbookModel.findGuestbookById(id);
    if (!entry) throw Object.assign(new Error('존재하지 않는 방명록입니다.'), { status: 404 });

    // 삭제 권한: 작성자 또는 프로필 주인
    if (entry.writer_id !== requesterId && entry.profile_user_id !== requesterId) {
        throw Object.assign(new Error('삭제 권한이 없습니다.'), { status: 403 });
    }
    await GuestbookModel.deleteGuestbook(id);
};
