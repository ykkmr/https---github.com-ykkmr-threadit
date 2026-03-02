import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import threadRoutes from './routes/thread.routes.js';
import authRoutes from './routes/auth.routes.js';
import agentRoutes from './routes/agent.routes.js';
import searchRoutes from './routes/search.routes.js';
import hashtagRoutes from './routes/hashtag.routes.js';
import mediaRoutes from './routes/media.routes.js';
import guestbookRoutes from './routes/guestbook.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 업로드된 파일 정적 서빙 — /uploads/파일명 으로 접근 가능
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API 라우터 등록
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/threads', threadRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/hashtags', hashtagRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/users', guestbookRoutes);

// 기본 에러 핸들링
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
    console.log(`🚀 Thread Community Server is running on port ${PORT}`);
});