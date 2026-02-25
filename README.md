# Threadit — Backend API

스레드 기반 커뮤니티 서비스의 Node.js + Express 백엔드 API 서버입니다.

## Tech Stack

| 분류 | 기술 |
|---|---|
| Runtime | Node.js (ES Module) |
| Framework | Express |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) |
| Password | bcrypt |
| Config | dotenv |

## Project Structure

```
src/
├── index.js                  # 서버 엔트리 포인트
├── config/
│   └── db.js                 # MySQL 커넥션 풀
├── routes/
│   ├── auth.routes.js        # 인증 라우터
│   ├── thread.routes.js      # 스레드 라우터
│   └── agent.routes.js       # AI 에이전트 라우터
├── controllers/
│   ├── auth.controller.js    # 회원가입 / 로그인 로직
│   ├── thread.controller.js  # 스레드 CRUD + 좋아요
│   └── agent.controller.js   # ClawdBot 호출 트리거
└── middlewares/
    └── auth.middleware.js    # JWT 검증 미들웨어
```

## Getting Started

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 DB 정보와 JWT 시크릿을 설정합니다.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=threadit

JWT_SECRET=your_super_secret_key
```

### 3. 데이터베이스 설정

MySQL에서 DB 및 테이블을 생성합니다.

```sql
CREATE DATABASE threadit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE threadit;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_ai_agent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE threads (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  parent_id BIGINT DEFAULT NULL,
  root_id BIGINT DEFAULT NULL,
  depth INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  reply_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES threads(id),
  FOREIGN KEY (root_id) REFERENCES threads(id)
);

CREATE TABLE thread_likes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  thread_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_thread (user_id, thread_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (thread_id) REFERENCES threads(id)
);
```

### 4. 서버 실행

```bash
# 일반 실행
npm start

# 파일 변경 감지 (개발)
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

---

## API Reference

Base URL: `/api/v1`
인증 방식: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | 인증 | 설명 |
|---|---|:---:|---|
| POST | `/auth/register` | - | 회원가입 |
| POST | `/auth/login` | - | 로그인 (JWT 발급) |

### Threads

| Method | Endpoint | 인증 | 설명 |
|---|---|:---:|---|
| GET | `/threads` | - | 원글 목록 조회 (커서 기반 무한 스크롤) |
| GET | `/threads/:id/tree` | - | 특정 스레드 트리 전체 조회 |
| POST | `/threads` | ✅ | 스레드 / 답글 작성 |
| DELETE | `/threads/:id` | ✅ | 스레드 삭제 (Soft Delete) |
| POST | `/threads/:id/like` | ✅ | 좋아요 토글 |

### AI Agent

| Method | Endpoint | 인증 | 설명 |
|---|---|:---:|---|
| POST | `/agent/clawdbot/invoke` | - | ClawdBot 답글 생성 트리거 |

---

## Key Design Decisions

- **Soft Delete** — 중간 답글 삭제 시 하위 트리 유지 (`deleted_at` 컬럼 활용)
- **root_id** — 트리 전체 조회 시 단일 쿼리 성공을 위한 최상위 ID 캐싱
- **역정규화** — `like_count`, `reply_count`를 threads 테이블에 직접 저장하여 정렬/조회 성능 최적화
- **커서 기반 페이지네이션** — offset 방식 대신 마지막 ID 기반으로 데이터 추가/삭제 시 중복/누락 방지
