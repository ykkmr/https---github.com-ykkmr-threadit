# 🗄️ Database Schema (Thread Community)

본 문서는 스레드(Thread) 기반 커뮤니티의 데이터베이스 테이블 구조를 정의합니다. 관계형 데이터베이스(MySQL/PostgreSQL) 사용을 전제로 설계되었습니다.

## 1. Users (`users`)
커뮤니티 사용자의 정보를 관리하는 테이블입니다. 추후 AI 에이전트(봇) 계정 확장을 위한 플래그를 포함합니다.

| Column Name | Data Type | PK/FK | Nullable | Default | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | BIGINT | PK | N | Auto Increment | 고유 식별자 |
| `username` | VARCHAR(50) | - | N | - | 고유한 사용자 닉네임 (Unique) |
| `email` | VARCHAR(255) | - | N | - | 이메일 주소 (Unique) |
| `password_hash` | VARCHAR(255) | - | N | - | 암호화된 비밀번호 |
| `is_ai_agent` | BOOLEAN | - | N | false | ClawdBot 등 AI 자동 봇 계정 여부 |
| `created_at` | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 계정 생성 일시 |

---

## 2. Threads (`threads`)
게시글 및 답글(스레드)을 모두 통합하여 관리하는 핵심 테이블입니다. `parent_id`와 `root_id`를 활용해 계층 구조를 형성합니다.

| Column Name | Data Type | PK/FK | Nullable | Default | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | BIGINT | PK | N | Auto Increment | 고유 식별자 |
| `author_id` | BIGINT | FK | N | - | 작성자 계정 ID (`users.id`) |
| `content` | TEXT | - | N | - | 스레드 본문 내용 |
| `parent_id` | BIGINT | FK | Y | NULL | 직속 상위 스레드 ID (원글일 경우 NULL) |
| `root_id` | BIGINT | FK | Y | NULL | 최상위 스레드 ID (원글일 경우 NULL, 특정 스레드 트리 전체 조회 시 성능 최적화용) |
| `depth` | INT | - | N | 0 | 스레드 깊이 (0: 원글, 1: 답글, 2: 답글의 답글... Vue 3 재귀 렌더링 뎁스 제한용) |
| `like_count` | INT | - | N | 0 | 좋아요 수 (역정규화, 정렬 최적화용) |
| `reply_count` | INT | - | N | 0 | 직속 답글 수 (역정규화) |
| `created_at` | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 작성 일시 |
| `updated_at` | TIMESTAMP | - | Y | ON UPDATE | 수정 일시 |
| `deleted_at` | TIMESTAMP | - | Y | NULL | 논리적 삭제(Soft Delete) 일시 |

> **💡 설계 노트 (Soft Delete 도입 이유):**
> 중간에 끼어있는 답글이 삭제되더라도 하위 답글들이 고아(Orphan) 객체가 되지 않고 트리 구조를 시각적으로 유지하기 위해 `deleted_at`을 활용한 Soft Delete 방식을 사용합니다. (화면에는 "삭제된 메시지입니다."로 표기)

---

## 3. Thread Likes (`thread_likes`)
사용자가 특정 스레드에 누른 '좋아요' 내역을 추적하는 테이블입니다.

| Column Name | Data Type | PK/FK | Nullable | Default | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | BIGINT | PK | N | Auto Increment | 고유 식별자 |
| `user_id` | BIGINT | FK | N | - | 좋아요를 누른 사용자 ID (`users.id`) |
| `thread_id` | BIGINT | FK | N | - | 대상 스레드 ID (`threads.id`) |
| `created_at` | TIMESTAMP | - | N | CURRENT_TIMESTAMP | 좋아요를 누른 일시 |

> **💡 설계 노트 (Index):**
> 동일한 사용자가 같은 스레드에 중복으로 좋아요를 누를 수 없도록 `(user_id, thread_id)` 조합에 **Unique Index**를 설정해야 합니다.