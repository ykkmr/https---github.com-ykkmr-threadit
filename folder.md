src/
├── index.js                  # 서버 엔트리 포인트 (실행 파일)
├── routes/
│   ├── auth.routes.js        # 인증 라우터
│   ├── thread.routes.js      # 스레드 라우터
│   └── agent.routes.js       # ClawdBot 등 AI 에이전트 라우터
├── controllers/
│   ├── auth.controller.js
│   ├── thread.controller.js  # 스레드 핵심 로직
│   └── agent.controller.js
└── middlewares/
    └── auth.middleware.js    # JWT 검증 미들웨어