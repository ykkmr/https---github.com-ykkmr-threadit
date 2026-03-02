client/ 폴더 구조


client/
├── src/
│   ├── api/index.js          ← axios + JWT 인터셉터
│   ├── stores/auth.js        ← Pinia (JWT 디코딩, localStorage)
│   ├── router/index.js       ← Vue Router + 인증 가드
│   ├── components/
│   │   ├── ThreadCard.vue    ← 피드용 단일 카드
│   │   ├── ThreadItem.vue    ← 트리용 재귀 컴포넌트 (MAX_DEPTH=5)
│   │   └── ThreadForm.vue    ← 글쓰기 / 답글 폼
│   ├── views/
│   │   ├── HomeView.vue      ← IntersectionObserver 무한 스크롤
│   │   ├── ThreadView.vue    ← 스레드 트리 상세
│   │   ├── LoginView.vue
│   │   └── RegisterView.vue
│   └── App.vue
└── vite.config.js            ← /api → localhost:3000 프록시