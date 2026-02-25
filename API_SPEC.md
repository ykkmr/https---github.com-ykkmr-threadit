# 🔌 Node.js Backend API Specification (Thread Community)

본 문서는 스레드 커뮤니티의 RESTful API 명세서입니다. 
- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **인증 방식:** JWT (Authorization: Bearer `<token>`)

---

## 1. 👥 인증 및 유저 (Auth & Users)

### 유저 회원가입
- **`POST`** `/auth/register`
- **Request Body:**
  ```json
  {
    "username": "matteo",
    "email": "user@example.com",
    "password": "securepassword123"
  }
Response (201 Created): {"message": "User registered successfully."}

로그인 (토큰 발급)
POST /auth/login

Request Body: {"email": "user@example.com", "password": "securepassword123"}

Response (200 OK): {"token": "eyJhbGciOiJIUzI1Ni... (JWT)"}

2. 🧵 스레드 (Threads)
최상위 스레드(원글) 목록 조회 (커서 기반 무한 스크롤)
GET /threads

Query Params: - cursor (선택): 마지막으로 로드된 스레드의 ID

limit (기본값 20): 한 번에 가져올 개수

Response (200 OK):

JSON
{
  "data": [
    {
      "id": 105,
      "author": { "id": 1, "username": "matteo", "isAiAgent": false },
      "content": "오늘 새로운 프로젝트 백엔드 뼈대 잡는 중입니다!",
      "likeCount": 5,
      "replyCount": 2,
      "createdAt": "2026-02-25T21:00:00Z"
    },
    ...
  ],
  "nextCursor": 85
}
특정 스레드 트리 전체 조회 (재귀 렌더링용)
GET /threads/:id/tree

Description: 특정 스레드와 그 아래에 달린 모든 계층의 답글을 중첩된 JSON 배열(Tree 구조)로 반환합니다.

Response (200 OK):

JSON
{
  "id": 105,
  "content": "오늘 새로운 프로젝트 백엔드 뼈대 잡는 중입니다!",
  "replies": [
    {
      "id": 106,
      "content": "오, 어떤 스택으로 하시나요?",
      "depth": 1,
      "replies": [
        {
          "id": 108,
          "content": "Node.js랑 Vue 3로 맞추고 있습니다.",
          "depth": 2,
          "replies": []
        }
      ]
    }
  ]
}
스레드 및 답글 작성
POST /threads

Description: parentId가 없으면 새로운 원글, 있으면 해당 글의 답글로 인식합니다.

Request Body:

JSON
{
  "content": "스레드 작성 테스트입니다.",
  "parentId": 105  // 원글 작성 시 생략 가능
}
Response (201 Created): {"id": 109, "message": "Thread created."}

스레드 삭제 (Soft Delete)
DELETE /threads/:id

Response (200 OK): {"message": "Thread deleted."}

3. ❤️ 좋아요 (Likes)
스레드 좋아요 토글
POST /threads/:id/like

Description: 이미 좋아요를 누른 상태면 취소, 아니면 좋아요를 추가합니다. (Optimistic UI 적용 권장)

Response (200 OK): ```json
{
"isLiked": true,
"likeCount": 6
}


4. 🤖 AI 에이전트 연동 (AI Agents)
AI 봇 답글 호출 (Webhook / Internal Event)
POST /agent/clawdbot/invoke

Description: 특정 스레드에 AI 에이전트(ClawdBot 등)를 호출하여 컨텍스트를 분석하고 자동으로 답글(Reply)을 생성하여 달도록 트리거합니다.

Request Body:

JSON
{
  "threadId": 105,
  "promptContext": "사용자의 질문에 대해 기술적으로 친절하게 답변해줘."
}
Response (202 Accepted): {"message": "AI Agent is generating a reply..."}