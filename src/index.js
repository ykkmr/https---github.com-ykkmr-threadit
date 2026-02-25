import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import threadRoutes from './routes/thread.routes.js';
import authRoutes from './routes/auth.routes.js';
import agentRoutes from './routes/agent.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json()); // JSON 요청 본문 파싱

// API 라우터 등록 (API 명세서의 Base URL 적용)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/threads', threadRoutes);
app.use('/api/v1/agent', agentRoutes);

// 기본 에러 핸들링
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Thread Community Server is running on port ${PORT}`);
});