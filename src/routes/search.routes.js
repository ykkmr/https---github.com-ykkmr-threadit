import { Router } from 'express';
import { search } from '../controllers/search.controller.js';

const router = Router();

// FEATURE_RULES.md: 검색어 최소 2자, 커서 기반 페이지네이션
// GET /api/v1/search?q=keyword&cursor=105&limit=20
router.get('/', search);

export default router;
