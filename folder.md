# 📁 Threadit — 프로젝트 파일 구조

MASTER_ARCHITECTURE_RULES.md 기준으로 구성된 실제 디렉토리 구조입니다.

---

## Backend (`src/`)

```
src/
├── index.js                      # Express 서버 엔트리 포인트
├── config/
│   └── db.js                     # MySQL 커넥션 풀
├── routes/
│   ├── auth.routes.js            # 인증 라우터
│   ├── thread.routes.js          # 스레드 라우터
│   └── agent.routes.js           # AI 에이전트 라우터
├── controllers/                  # Req/Res 핸들링만 담당
│   ├── auth.controller.js
│   ├── thread.controller.js
│   └── agent.controller.js
├── services/                     # 🧠 [핵심] 비즈니스 로직
│   ├── auth.service.js           # 회원가입/로그인 로직, JWT 발급
│   ├── thread.service.js         # 스레드 CRUD, 좋아요, buildTree
│   └── agent.service.js          # ClawdBot 호출 오케스트레이션
├── models/                       # DB 쿼리 로직 (Raw SQL)
│   ├── user.model.js
│   └── thread.model.js
├── sockets/                      # 비동기 실시간 통신
│   └── thread.socket.js          # SSE 핸들러 (실시간 피드, 좋아요 Push)
└── middlewares/
    └── auth.middleware.js         # JWT 검증 미들웨어
```

---

## Frontend (`client/src/`)

```
client/src/
├── App.vue                       # 최상위 루트 컴포넌트
├── main.js                       # Vue 앱 인스턴스 초기화
├── assets/                       # 정적 파일 (이미지, 폰트, 글로벌 CSS) — kebab-case
├── audio/                        # 🎵 Tone.js 오디오 모듈 클래스 및 래퍼 함수
├── api/
│   └── index.js                  # axios 인스턴스 + API 함수 모음
├── composables/                  # Vue 3 재사용 가능한 상태 로직 (use* 네이밍)
│   ├── useAuth.js
│   ├── useThreads.js             # 커서 기반 무한 스크롤 + 낙관적 업데이트
│   └── useTimeAgo.js             # 상대/절대 시간 표기
├── components/
│   ├── common/                   # 버튼, 모달, GNB 등 공통 UI
│   ├── thread/                   # 스레드 전용 컴포넌트 (PascalCase)
│   │   ├── ThreadCard.vue
│   │   ├── ThreadForm.vue
│   │   └── ThreadItem.vue
│   └── synth/                    # 신디사이저 관련 컴포넌트
├── router/
│   └── index.js                  # Vue Router 설정
├── stores/
│   └── auth.js                   # Pinia 전역 상태 (유저 정보)
└── views/                        # 라우터와 1:1 매칭되는 페이지 (*View.vue)
    ├── HomeView.vue
    ├── LoginView.vue
    ├── RegisterView.vue
    └── ThreadView.vue
```

---

## 계층 간 의존 방향

```
Routes → Controllers → Services → Models → DB
                         ↑
                     Sockets (SSE Push)
```

- **Controllers**: req/res 처리만, 비즈니스 로직 없음
- **Services**: 비즈니스 로직 + 검증, Models 호출
- **Models**: Raw SQL 쿼리만 담당
- **Sockets**: SSE 연결 관리, Services 완료 후 Push
