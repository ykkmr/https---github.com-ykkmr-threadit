# Threadit — Frontend

스레드 기반 커뮤니티 서비스의 Vue 3 프론트엔드 클라이언트입니다.

## Tech Stack

| 분류 | 기술 |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build Tool | Vite |
| Routing | Vue Router 4 |
| State | Pinia |
| HTTP | Axios |

## Project Structure

```
client/
├── src/
│   ├── api/
│   │   └── index.js          # API 호출 모듈 (axios 인스턴스 + JWT 인터셉터)
│   ├── stores/
│   │   └── auth.js           # 인증 상태 관리 (Pinia)
│   ├── router/
│   │   └── index.js          # 라우터 설정 + 네비게이션 가드
│   ├── components/
│   │   ├── ThreadCard.vue    # 피드용 스레드 카드 컴포넌트
│   │   ├── ThreadItem.vue    # 트리용 재귀 컴포넌트 (MAX_DEPTH=5)
│   │   └── ThreadForm.vue    # 글쓰기 / 답글 작성 폼
│   ├── views/
│   │   ├── HomeView.vue      # 메인 피드 (무한 스크롤)
│   │   ├── ThreadView.vue    # 스레드 트리 상세 페이지
│   │   ├── LoginView.vue     # 로그인
│   │   └── RegisterView.vue  # 회원가입
│   ├── App.vue               # 루트 컴포넌트 (네비게이션 바)
│   └── main.js               # 앱 엔트리 포인트
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

### 1. 패키지 설치

```bash
cd client
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:5173`에서 실행됩니다.
백엔드(`localhost:3000`)로의 API 요청은 Vite 프록시가 자동으로 처리합니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

---

## Pages & Features

### 메인 피드 (`/`)

- 최상위 원글 목록을 커서 기반 무한 스크롤로 표시
- `IntersectionObserver`를 사용해 스크롤 감지
- 로그인 상태에서 상단 작성 폼으로 새 스레드 게시 가능
- 낙관적 업데이트 — 새 글 작성 시 서버 응답 전에 즉시 화면 반영

### 스레드 상세 (`/thread/:id`)

- 특정 스레드와 모든 하위 답글을 중첩 트리 구조로 표시
- `ThreadItem.vue`가 `replies` 배열을 재귀적으로 렌더링
- 최대 렌더링 깊이(MAX_DEPTH=5) 초과 시 "답글 더 보기" 링크로 분리

### 로그인 (`/login`) / 회원가입 (`/register`)

- JWT 토큰을 발급받아 `localStorage`에 저장
- 로그인 상태이면 접근 시 메인으로 리다이렉트

---

## Key Implementation Details

### 낙관적 업데이트 (Optimistic UI)

좋아요 토글 시 서버 응답을 기다리지 않고 카운트를 즉시 변경합니다. 실패 시 이전 상태로 자동 롤백됩니다.

```js
// 낙관적으로 먼저 반영
const prev = { isLiked: isLiked.value, likeCount: likeCount.value }
isLiked.value = !isLiked.value
likeCount.value += isLiked.value ? 1 : -1

try {
  const { data } = await toggleLike(thread.id)
  isLiked.value = data.isLiked
  likeCount.value = data.likeCount
} catch {
  // 실패 시 롤백
  isLiked.value = prev.isLiked
  likeCount.value = prev.likeCount
}
```

### 재귀 컴포넌트

`ThreadItem.vue`는 자기 자신을 import하여 무한 깊이의 답글 트리를 렌더링합니다.

```vue
<script setup>
import ThreadItem from './ThreadItem.vue' // self-import
</script>

<template>
  <div v-if="thread.depth < MAX_DEPTH">
    <ThreadItem v-for="reply in replies" :key="reply.id" :thread="reply" />
  </div>
  <RouterLink v-else :to="`/thread/${thread.id}`">답글 더 보기</RouterLink>
</template>
```

### JWT 인터셉터

axios 요청 인터셉터가 모든 요청 헤더에 JWT를 자동으로 주입합니다.

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

## Development Notes

- 백엔드 서버(`localhost:3000`)가 먼저 실행 중이어야 합니다.
- `vite.config.js`의 proxy 설정으로 CORS 없이 API 통신이 가능합니다.
