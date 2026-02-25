import { Router } from 'express';
import { invokeClawdBot } from '../controllers/agent.controller.js';

const router = Router();

// ClawdBot AI 에이전트 답글 생성 트리거
router.post('/clawdbot/invoke', invokeClawdBot);

export default router;
