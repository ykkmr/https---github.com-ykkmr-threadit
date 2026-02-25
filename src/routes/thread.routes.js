import { Router } from 'express';
import {
    getThreads,
    getThreadTree,
    createThread,
    deleteThread,
    toggleLike
} from '../controllers/thread.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. 최상위 스레드 목록 조회 (커서 무한 스크롤)
router.get('/', getThreads);

// 2. 특정 스레드 트리 전체 조회 (재귀 렌더링용)
router.get('/:id/tree', getThreadTree);

// 3. 스레드 및 답글 작성 (인증 필요)
router.post('/', verifyToken, createThread);

// 4. 스레드 삭제 (인증 필요)
router.delete('/:id', verifyToken, deleteThread);

// 5. 스레드 좋아요 토글 (인증 필요)
router.post('/:id/like', verifyToken, toggleLike);

export default router;
