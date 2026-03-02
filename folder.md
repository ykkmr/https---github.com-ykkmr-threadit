# 📁 Threadit — 전체 파일 구조 (최종)

모든 마크다운 문서 (MASTER_ARCHITECTURE_RULES, ASYNC_UPDATES, CONTENT_AND_FILE_RULES,
FEATURE_RULES, PERIPHERAL_FEATURES, API_SPEC, Database Schema, AGENT_COGNITIVE_RULES) 기준.

---

## Backend (`src/`)

```
src/
├── index.js                          # Express 서버 엔트리 포인트
├── config/
│   └── db.js                         # MySQL 커넥션 풀
│
├── routes/                           # URI ↔ Controller 연결만 담당
│   ├── auth.routes.js
│   ├── thread.routes.js
│   ├── agent.routes.js
│   ├── search.routes.js              # GET /search?q=keyword (Full-Text)
│   ├── hashtag.routes.js             # GET /hashtags/trending, /:name
│   ├── media.routes.js               # POST /media/presign, /media
│   └── guestbook.routes.js           # GET/POST/DELETE /users/:userId/guestbook
│
├── controllers/                      # Req/Res 핸들링만 — 비즈니스 로직 없음
│   ├── auth.controller.js
│   ├── thread.controller.js
│   ├── agent.controller.js
│   ├── search.controller.js
│   ├── hashtag.controller.js
│   ├── media.controller.js
│   └── guestbook.controller.js
│
├── services/                         # 🧠 [핵심] 비즈니스 로직 계층
│   ├── auth.service.js               # 회원가입/로그인, bcrypt, JWT
│   ├── thread.service.js             # buildTree, 낙관적 업데이트 검증
│   ├── agent.service.js              # ClawdBot 인지 프레임워크 오케스트레이션
│   ├── search.service.js             # 키워드 검증, Full-Text Search
│   ├── hashtag.service.js            # 정규식 추출(#tag), 소문자 정규화
│   ├── media.service.js              # Pre-signed URL 발급, UUID+타임스탬프 파일명
│   └── guestbook.service.js          # 1 Depth 제한, 비밀글 권한 검증
│
├── models/                           # Raw SQL 쿼리 — DB 접근 계층
│   ├── user.model.js
│   ├── thread.model.js
│   ├── hashtag.model.js              # tags, thread_tags (M:N)
│   ├── media.model.js                # media_attachments
│   ├── guestbook.model.js            # guestbooks
│   └── search.model.js              # FULLTEXT INDEX 쿼리
│
├── sockets/                          # 비동기 실시간 통신
│   └── thread.socket.js              # SSE 핸들러 (NEW_REPLY, LIKE_UPDATE, BOT_TYPING)
│                                     # WebSocket (Co-op Synth, DM)은 추후 추가
│
└── middlewares/
    └── auth.middleware.js            # authenticate (필수), optionalAuthenticate (선택)
                                      # verifyToken alias 유지 (하위 호환)
```

---

## Frontend (`client/src/`)

```
client/src/
├── App.vue                           # 루트: GNB + Toast + RouterView 배치
├── main.js                           # Vue 앱 초기화 (Pinia, Router)
│
├── assets/                           # 정적 파일 — kebab-case 필수
│   └── (예: default-avatar.png, global.css)
│
├── audio/                            # 🎵 Tone.js 오디오 모듈 (신디사이저 기능)
│
├── api/
│   └── index.js                      # axios 인스턴스 + 모든 API 함수 모음
│
├── composables/                      # use* 네이밍 필수, 재사용 가능한 상태 로직
│   ├── useAuth.js                    # 로그인/로그아웃/회원가입
│   ├── useThreads.js                 # 커서 기반 무한 스크롤 + 낙관적 업데이트
│   ├── useTimeAgo.js                 # timeAgo() 상대시간, exactDate() 절대시간
│   ├── useSSE.js                     # SSE 연결/해제, 이벤트 구독
│   ├── usePollTrends.js              # 트렌딩 폴링 (1분 주기, Page Visibility API)
│   └── useSearch.js                  # 검색 (300ms 디바운싱, 최소 2자)
│
├── stores/                           # Pinia 전역 상태 (Single Source of Truth)
│   ├── auth.js                       # 유저 로그인 정보
│   └── ui.js                         # 전역 Toast, 모달 상태
│
├── components/
│   ├── common/                       # 공통 UI 컴포넌트
│   │   ├── GNB.vue                   # Sticky 헤더, 통합 검색바, Off-canvas 모바일 메뉴
│   │   ├── AdSlot.vue                # 광고 슬롯 (IntersectionObserver Lazy, min-height CLS 방지)
│   │   └── Toast.vue                 # 비동기 에러/성공 알림 (낙관적 업데이트 실패 롤백)
│   │
│   ├── thread/                       # 스레드 전용 컴포넌트 (PascalCase)
│   │   ├── ThreadCard.vue            # 피드(HomeView)용 단일 카드
│   │   ├── ThreadForm.vue            # 스레드/답글 작성 폼
│   │   └── ThreadItem.vue            # 트리(ThreadView)용 재귀 컴포넌트
│   │
│   ├── guestbook/                    # 방명록 전용 컴포넌트
│   │   ├── GuestbookItem.vue         # 원글 + 주인장 답글 (1 Depth Flat)
│   │   └── GuestbookForm.vue         # 방명록 작성 (비밀글 체크박스)
│   │
│   └── synth/                        # 신디사이저 관련 컴포넌트 (추후 구현)
│
├── router/
│   └── index.js                      # Vue Router 설정
│
└── views/                            # 라우터 1:1 매칭 페이지 (*View.vue 필수)
    ├── HomeView.vue                  # 스레드 피드 (무한 스크롤)
    ├── ThreadView.vue                # 스레드 트리 상세
    ├── LoginView.vue
    ├── RegisterView.vue
    ├── ProfileView.vue               # 유저 프로필 + 방명록 + 사이드 광고
    ├── SearchView.vue                # 검색 결과 (스레드 + 유저)
    └── HashtagView.vue               # 해시태그별 스레드 목록
```

---

## 계층 간 의존 방향

```
Routes → Controllers → Services → Models → DB
                                       ↑
                            Sockets/SSE (이벤트 Push)
```

---

## 핵심 규칙 요약

### 파일명 규칙 (CONTENT_AND_FILE_RULES.md)
| 대상 | 규칙 | 예시 |
|---|---|---|
| Vue 컴포넌트 | PascalCase | `ThreadItem.vue` |
| 라우터 페이지 | *View.vue | `ProfileView.vue` |
| Composable | use* | `useTimeAgo.js` |
| assets 파일 | kebab-case | `default-avatar.png` |
| 미디어 업로드 파일명 | UUID + 타임스탬프 | `f8a1d-20260302.webp` |
| Backend 파일 | [도메인].[역할].js | `thread.service.js` |
| Import 경로 | @ alias 사용 | `@/components/thread/ThreadItem.vue` |

### 비동기 갱신 결정 매트릭스 (ASYNC_UPDATES.md)
| 기능 | 방식 | 주기/조건 |
|---|---|---|
| 트렌딩 해시태그, 조회수 | HTTP Polling | 1분 (탭 활성화 시에만) |
| 실시간 답글, 좋아요, 봇 타이핑 | SSE (useSSE.js) | 이벤트 발생 즉시 |
| Co-op 신디사이저, DM | WebSocket | 액션 발생 즉시 (ms 단위) |

### 시간 표기 규칙 (CONTENT_AND_FILE_RULES.md §1.1)
- 기본: 상대 시간 (`방금 전`, `3분 전`) → `useTimeAgo.js` 사용
- 마우스 오버: `title` 속성으로 절대 시간 (`YYYY-MM-DD HH:mm:ss`)

### 미디어 업로드 규칙 (FEATURE_RULES.md §3)
- 이미지: 최대 5MB, jpeg/png/webp 허용
- 동영상: 최대 50MB, mp4/webm 허용
- 파일명: `UUID앞8자리-YYYYMMDD.확장자` (media.service.js `generateStorageKey()`)
- 아키텍처: Pre-signed URL → 프론트가 S3 직접 업로드 → CDN URL DB 저장

### AI 에이전트 인지 규칙 (AGENT_COGNITIVE_RULES.md)
응답 포맷: `{ thinking, hypothesis_testing, final_conclusion }`
1. 문제 분해 → 2. 가설 수립/검증 → 3. 최종 결론 도출
