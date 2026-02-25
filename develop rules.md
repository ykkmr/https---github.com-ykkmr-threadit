# 📜 Development Guidelines & Rules

본 문서는 스레드(Thread) 기반 커뮤니티 프로젝트의 원활한 개발과 유지보수를 위한 그라운드 룰입니다. 모든 코드는 이 규칙을 준수하여 작성되어야 합니다.

## 🏗 1. Tech Stack & Environment
- **Frontend:** Vue 3 (Composition API, `<script setup>` 권장)
- **Backend:** Node.js, Express
- **Package Manager:** npm (또는 yarn/pnpm - 프로젝트 셋업 시 통일)
- **Code Formatter & Linter:** Prettier, ESLint 필수 적용

## 🌿 2. Branch Strategy (GitHub Flow)
단순하고 빠른 배포를 위해 GitHub Flow를 지향합니다.
- `main` : 언제든 배포 가능한 상용 환경의 브랜치 (직접 Commit 금지)
- `feature/[기능명]` : 새로운 기능 개발 브랜치 (예: `feature/thread-reply`)
- `fix/[버그명]` : 버그 수정 브랜치 (예: `fix/infinite-scroll-bug`)
- `refactor/[작업명]` : 코드 리팩토링 브랜치

*모든 작업은 `main` 브랜치에서 파생되어야 하며, 작업 완료 후 Pull Request(PR)를 통해 병합합니다.*

## 💬 3. Commit Convention (Conventional Commits)
커밋 메시지는 작업 내용을 명확히 파악할 수 있도록 아래의 접두어를 사용합니다.

- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정 (README, RULES 등)
- `style:` 코드 포맷팅, 세미콜론 누락 등 (코드 로직 변경 없음)
- `refactor:` 코드 리팩토링
- `test:` 테스트 코드 추가 및 리팩토링
- `chore:` 빌드 업무 수정, 패키지 매니저 수정 등

**[작성 예시]**
> feat: 스레드 답글 작성을 위한 재귀 컴포넌트 추가
> fix: 커서 기반 페이지네이션 중복 데이터 호출 버그 수정

## 💻 4. Coding Standards & Naming
- **변수 및 함수:** `camelCase` 사용 (예: `getThreadList`, `replyCount`)
- **Vue 컴포넌트:** `PascalCase` 사용 및 Multi-word 권장 (예: `ThreadItem.vue`, `ReplyForm.vue`)
- **상수:** `UPPER_SNAKE_CASE` 사용 (예: `MAX_THREAD_DEPTH = 5`)
- **상태 관리:** 부모-자식 간의 Props/Emit을 우선하되, 전역 상태(로그인 유저 정보 등)는 Pinia 등을 활용해 최소화합니다.

## 🧵 5. Thread Community Specific Rules
스레드 구조의 특수성을 고려하여 아래 규칙을 엄격히 준수합니다.
1. **Depth 제한:** UI 깨짐 방지를 위해 답글의 렌더링 깊이(Depth)는 최대 $N$단계로 제한하며, 초과 시 "답글 더 보기" 형태의 새 뷰(View)로 분리합니다.
2. **페이지네이션:** 데이터의 잦은 추가/삭제를 고려하여, 오프셋(Offset) 방식이 아닌 마지막 아이템의 ID를 기준으로 하는 **커서(Cursor) 기반 무한 스크롤**을 기본으로 구현합니다.
3. **낙관적 업데이트 (Optimistic UI):** 답글 작성, 좋아요 등의 액션은 서버 응답을 기다리지 않고 클라이언트 화면에 먼저 반영하여 유저 경험(UX)을 극대화합니다.

## 🤖 6. AI Assistant Protocol
개발 생산성 향상을 위해 AI 어시스턴트(ClawdBot, Gemini 등)를 적극 활용합니다.
- 복잡한 스레드 재귀 로직, 정규식 작성, 보일러플레이트 코드 생성에 우선 활용합니다.
- AI가 생성한 코드는 프로젝트의 Naming Convention과 구조에 맞게 반드시 한 번 더 검토(Refine) 후 적용합니다.