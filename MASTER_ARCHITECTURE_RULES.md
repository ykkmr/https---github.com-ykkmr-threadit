# 🏛️ Master Architecture & Development Ground Rules

> **💡 핵심 철학 (The Philosophy of Rules)**
> "명확한 지식을 기반으로 기본적인 룰을 정해놓아야 개발 중 길을 잃고 방황하지 않는다."
> 본 문서는 프로젝트의 뼈대가 되는 파일 폴더 구조와, 가장 버그가 발생하기 쉬운 '비동기 데이터 갱신'에 대한 명확한 통제 규칙(갱신록)을 정의합니다.

---

## 1. 프로젝트 파일 구성 룰 (Directory Structure)

프론트엔드(Vue 3)와 백엔드(Node.js)를 분리하여 관리하며, 각 계층의 역할을 명확히 나누어 파일이 섞이는 것을 방지합니다.

### 1.1. Frontend (Vue 3 + Vite)
뷰(View)와 비즈니스 로직(Composable), 그리고 오디오 엔진(Tone.js)을 철저히 분리합니다.

```text
frontend/
├── src/
│   ├── assets/         # 정적 파일 (이미지, 폰트, 글로벌 CSS)
│   ├── audio/          # 🎵 [핵심] Tone.js 관련 오디오 모듈 클래스 및 래퍼 함수
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   ├── common/     # 버튼, 모달, 네비게이션 바
│   │   ├── thread/     # 재귀 스레드 아이템, 방명록 컴포넌트
│   │   └── synth/      # 노드 에디터, 오실레이터 패널 등
│   ├── composables/    # Vue 3 Composition API (재사용 가능한 상태 및 로직, ex: useAuth, useSynth)
│   ├── router/         # Vue Router 설정
│   ├── stores/         # Pinia 전역 상태 관리 (유저 정보, 글로벌 UI 상태)
│   ├── views/          # 라우터와 1:1로 매칭되는 페이지 (Home, SynthBuilder, Profile)
│   ├── App.vue         # 최상위 루트 컴포넌트
│   └── main.js         # Vue 앱 인스턴스 초기화

1.2. Backend (Node.js + Express)
라우팅, 비즈니스 로직(Controller), 데이터베이스 접근(Repository/Model)을 3계층으로 분리합니다.

backend/
├── src/
│   ├── config/         # 환경변수, DB 접속, AWS S3 설정 파일
│   ├── controllers/    # 클라이언트 요청 처리 및 응답 (Req, Res 핸들링)
│   ├── middlewares/    # JWT 검증, Rate Limiter, 에러 핸들링 미들웨어
│   ├── models/         # DB 스키마 정의 및 쿼리 로직 (Prisma, Sequelize 등)
│   ├── routes/         # 엔드포인트 URI와 컨트롤러를 연결 (thread.routes.js 등)
│   ├── services/       # 🧠 [핵심] 실제 비즈니스 로직이 실행되는 곳 (컨트롤러에서 호출)
│   ├── sockets/        # 비동기 양방향 통신(WebSocket) 이벤트 핸들러
│   └── index.js        # Express 서버 엔트리 포인트

2. 비동기 필수 갱신록 (Asynchronous Update Log Rules)
스레드 작성, 알림, 신디사이저 노브 조작 등 수많은 비동기 이벤트가 동시다발적으로 일어날 때, **"누가, 언제, 어떻게 데이터를 갱신했는가"**를 추적하지 못하면 치명적인 버그가 발생합니다.

2.1. 비동기 갱신 3원칙
단일 진실 공급원 (Single Source of Truth): 클라이언트 화면의 데이터를 갱신할 때는 반드시 Pinia Store 또는 명확히 정의된 Composable 상태만을 수정합니다. 컴포넌트 내부에 개별적인 상태를 중복해서 갖지 않습니다.

낙관적 업데이트 (Optimistic Update) 로깅: 서버의 응답을 기다리지 않고 화면을 먼저 갱신할 때는, 실패 시 롤백할 수 있도록 이전 상태를 반드시 메모리에 기록(Log)해야 합니다.

디바운싱 통제: 사용자의 연속된 입력(노브 조작, 타이핑)으로 인한 비동기 호출은 반드시 마지막 입력 후 300ms 지연을 두고 서버에 갱신합니다.

2.2. 비동기 갱신록 (Update Log Matrix)
개발 시 기능 구현 전, 아래의 갱신록 규격에 맞춰 로직을 먼저 설계해야 합니다.

기능 (Feature)	트리거 (Trigger)	갱신 방식 (Method)	프론트엔드 상태 갱신 로직	백엔드 처리 및 로그 규격		
스레드 새 답글	타 유저의 작성	SSE (Push)	threads.value.unshift(newData)	[SSE Emit] thread_id: 105, action: NEW_REPLY		
좋아요 클릭	유저 버튼 클릭	HTTP API + 낙관적 갱신	likeCount++ (실패 시 likeCount-- 롤백)	[HTTP POST] /threads/:id/like, status: 200		
조회수 / 트렌드	1분 경과	Polling (Timer)	background fetch -> state replace	[HTTP GET] /trends, action: POLLING		
신스 노브 조작	유저 드래그 (연속)	WebSocket (Room)	UI 즉시 변경 -> 300ms 후 소켓 Emit	[WS Emit] patch_id: 8, param: cutoff, val: 400		

Gemini의 응답
개발을 진행하다 보면 수많은 파일과 비동기 로직 속에서 길을 잃고 "내가 지금 뭘 짜고 있었지?" 하며 방황(Context Switching)하기 쉽습니다. 마태오님께서 짚어주신 **"명확한 지식을 기반으로 룰을 먼저 세워야 흔들리지 않는다"**는 원칙은 프로젝트의 성공을 결정짓는 가장 핵심적인 개발 철학입니다.

이 철학을 바탕으로, 프로젝트의 전체 파일 디렉토리 구조와 상태 충돌을 막기 위한 비동기 갱신록(Async Update Log) 규칙을 명문화한 마스터 문서를 작성해 드립니다. MASTER_ARCHITECTURE_RULES.md 로 저장하여 프로젝트의 나침반으로 삼아보세요.

Markdown
# 🏛️ Master Architecture & Development Ground Rules

> **💡 핵심 철학 (The Philosophy of Rules)**
> "명확한 지식을 기반으로 기본적인 룰을 정해놓아야 개발 중 길을 잃고 방황하지 않는다."
> 본 문서는 프로젝트의 뼈대가 되는 파일 폴더 구조와, 가장 버그가 발생하기 쉬운 '비동기 데이터 갱신'에 대한 명확한 통제 규칙(갱신록)을 정의합니다.

---

## 1. 프로젝트 파일 구성 룰 (Directory Structure)

프론트엔드(Vue 3)와 백엔드(Node.js)를 분리하여 관리하며, 각 계층의 역할을 명확히 나누어 파일이 섞이는 것을 방지합니다.

### 1.1. Frontend (Vue 3 + Vite)
뷰(View)와 비즈니스 로직(Composable), 그리고 오디오 엔진(Tone.js)을 철저히 분리합니다.

```text
frontend/
├── src/
│   ├── assets/         # 정적 파일 (이미지, 폰트, 글로벌 CSS)
│   ├── audio/          # 🎵 [핵심] Tone.js 관련 오디오 모듈 클래스 및 래퍼 함수
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   ├── common/     # 버튼, 모달, 네비게이션 바
│   │   ├── thread/     # 재귀 스레드 아이템, 방명록 컴포넌트
│   │   └── synth/      # 노드 에디터, 오실레이터 패널 등
│   ├── composables/    # Vue 3 Composition API (재사용 가능한 상태 및 로직, ex: useAuth, useSynth)
│   ├── router/         # Vue Router 설정
│   ├── stores/         # Pinia 전역 상태 관리 (유저 정보, 글로벌 UI 상태)
│   ├── views/          # 라우터와 1:1로 매칭되는 페이지 (Home, SynthBuilder, Profile)
│   ├── App.vue         # 최상위 루트 컴포넌트
│   └── main.js         # Vue 앱 인스턴스 초기화
1.2. Backend (Node.js + Express)
라우팅, 비즈니스 로직(Controller), 데이터베이스 접근(Repository/Model)을 3계층으로 분리합니다.

Plaintext
backend/
├── src/
│   ├── config/         # 환경변수, DB 접속, AWS S3 설정 파일
│   ├── controllers/    # 클라이언트 요청 처리 및 응답 (Req, Res 핸들링)
│   ├── middlewares/    # JWT 검증, Rate Limiter, 에러 핸들링 미들웨어
│   ├── models/         # DB 스키마 정의 및 쿼리 로직 (Prisma, Sequelize 등)
│   ├── routes/         # 엔드포인트 URI와 컨트롤러를 연결 (thread.routes.js 등)
│   ├── services/       # 🧠 [핵심] 실제 비즈니스 로직이 실행되는 곳 (컨트롤러에서 호출)
│   ├── sockets/        # 비동기 양방향 통신(WebSocket) 이벤트 핸들러
│   └── index.js        # Express 서버 엔트리 포인트
2. 비동기 필수 갱신록 (Asynchronous Update Log Rules)
스레드 작성, 알림, 신디사이저 노브 조작 등 수많은 비동기 이벤트가 동시다발적으로 일어날 때, **"누가, 언제, 어떻게 데이터를 갱신했는가"**를 추적하지 못하면 치명적인 버그가 발생합니다.

2.1. 비동기 갱신 3원칙
단일 진실 공급원 (Single Source of Truth): 클라이언트 화면의 데이터를 갱신할 때는 반드시 Pinia Store 또는 명확히 정의된 Composable 상태만을 수정합니다. 컴포넌트 내부에 개별적인 상태를 중복해서 갖지 않습니다.

낙관적 업데이트 (Optimistic Update) 로깅: 서버의 응답을 기다리지 않고 화면을 먼저 갱신할 때는, 실패 시 롤백할 수 있도록 이전 상태를 반드시 메모리에 기록(Log)해야 합니다.

디바운싱 통제: 사용자의 연속된 입력(노브 조작, 타이핑)으로 인한 비동기 호출은 반드시 마지막 입력 후 300ms 지연을 두고 서버에 갱신합니다.

2.2. 비동기 갱신록 (Update Log Matrix)
개발 시 기능 구현 전, 아래의 갱신록 규격에 맞춰 로직을 먼저 설계해야 합니다.

기능 (Feature)	트리거 (Trigger)	갱신 방식 (Method)	프론트엔드 상태 갱신 로직	백엔드 처리 및 로그 규격
스레드 새 답글	타 유저의 작성	SSE (Push)	threads.value.unshift(newData)	[SSE Emit] thread_id: 105, action: NEW_REPLY
좋아요 클릭	유저 버튼 클릭	HTTP API + 낙관적 갱신	likeCount++ (실패 시 likeCount-- 롤백)	[HTTP POST] /threads/:id/like, status: 200
조회수 / 트렌드	1분 경과	Polling (Timer)	background fetch -> state replace	[HTTP GET] /trends, action: POLLING
신스 노브 조작	유저 드래그 (연속)	WebSocket (Room)	UI 즉시 변경 -> 300ms 후 소켓 Emit	[WS Emit] patch_id: 8, param: cutoff, val: 400


2.3. 비동기 에러 갱신 및 복구 (Fallback)
비동기 통신이 실패(Timeout, 500 Error 등)했을 때 화면이 멈춰있는 현상을 방지하기 위한 룰입니다.

모든 비동기 API 호출은 try-catch 블록으로 감쌉니다.

에러 발생 시 사용자에게 토스트(Toast) 알림으로 [동기화 실패: 네트워크를 확인해주세요] 메시지를 띄우고, 낙관적으로 변경했던 UI를 이전 상태(갱신록 데이터)로 롤백합니다.

