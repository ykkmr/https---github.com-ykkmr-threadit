# 🧩 Peripheral Features & UI Guidelines

본 문서는 스레드 커뮤니티의 메인 컨텐츠를 보조하는 사이드 광고, 글로벌 메뉴/검색, 그리고 유저 프로필 방명록 기능에 대한 개발 및 UI/UX 가이드라인입니다.



---

## 1. 사이드 광고 영역 (Side Ad Placements)

광고는 커뮤니티의 주요 수익원이지만, 유저의 스레드 읽기나 신디사이저 조작 경험을 방해해서는 안 됩니다.

### 1.1. 레이아웃 및 렌더링 규칙
- **위치:** 데스크탑 기준 우측 사이드바(Right Sidebar)에 고정폭(예: 300px)으로 배치합니다. 모바일에서는 메인 스레드 피드 중간중간(In-feed)에 자연스럽게 삽입되도록 반응형(Responsive)으로 설계합니다.
- **지연 로딩 (Lazy Loading) 필수:** 광고 스크립트(Google AdSense 등)가 메인 스레드 데이터 렌더링을 지연시키지 않도록 `defer` 또는 `async` 속성을 사용하고, 화면에 보일 때만 렌더링하는 `IntersectionObserver`를 활용합니다.
- **CLS(Cumulative Layout Shift) 방지:** 광고가 늦게 뜨면서 화면이 덜컹거리는 현상을 막기 위해, 광고가 들어갈 `<div class="ad-slot">` 영역의 최소 높이(Min-Height)를 CSS로 미리 확보해 두어야 합니다.

---

## 2. 글로벌 메뉴 및 통합 검색 (Menu & Global Search)

유저가 커뮤니티 내 어디에 있든 길을 잃지 않고 원하는 정보(해시태그, 패치, 유저)를 찾을 수 있어야 합니다.

### 2.1. 글로벌 GNB (Global Navigation Bar)
- **상단 고정 (Sticky Header):** 스크롤을 내려도 항상 상단에 고정되어 빠른 메뉴 이동이 가능하게 합니다. z-index 관리를 철저히 하여 드롭다운이나 모달 창과 겹치지 않게 설계합니다.
- **반응형 햄버거 메뉴:** 모바일 화면에서는 공간 확보를 위해 전체 메뉴를 햄버거 아이콘 내부의 Off-canvas 드로어(Drawer) 폼으로 숨깁니다.

### 2.2. 통합 검색바 (Search Bar)
- **자동 완성 및 미리보기 (Auto-suggest):** 검색어 입력 시 드롭다운 창이 열리며 일치하는 '해시태그'와 '유저명'을 즉각적으로 보여줍니다. (앞서 정의한 `300ms 디바운싱` 룰 엄격 적용)
- **검색 히스토리 (Recent Searches):** 최근 검색어는 서버 DB를 낭비하지 않고 프론트엔드의 `localStorage`에 배열 형태로 저장하여 브라우저 단에서 빠르게 로드합니다.

---

## 3. 유저 방명록 (Guestbook / Profile Wall)

메인 스레드가 '주제' 중심의 소통이라면, 방명록은 특정 '유저' 중심의 가벼운 소통 공간입니다. 

### 3.1. 스레드와의 구조적 차이점
- **Depth 제한 (Flat Structure):** 메인 스레드처럼 무한 대댓글 구조를 허용하지 않습니다. 방명록은 오직 1개의 원글과 1개의 답글(주인장의 답글)만 허용하는 **1 Depth 구조**로 제한하여 UI를 가볍게 유지합니다.
- **미디어 업로드 제한:** 트래픽 관리를 위해 방명록에는 사진이나 동영상 업로드를 제한하고, 순수 텍스트와 이모지, 그리고 신디사이저 패치 공유 링크만 허용합니다.

### 3.2. 어뷰징 및 스팸 방지 (Security)
- **Rate Limiting (도배 방지):** 동일한 IP 또는 유저 계정에서 1분 이내에 작성할 수 있는 방명록 개수를 3회로 제한합니다. (Node.js의 `express-rate-limit` 미들웨어 활용)
- **비밀글 기능:** 작성자와 프로필 주인만 볼 수 있는 '비밀물통(Secret)' 체크박스를 제공하여 개인적인 소통을 지원합니다.

### 3.3. 방명록 DB 스키마 (`guestbooks`)
메인 `threads` 테이블과 분리하여 관리하는 것이 성능상 유리합니다.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | 방명록 고유 ID |
| `profile_user_id` | BIGINT | FK (users.id) | 방명록 주인의 ID |
| `writer_id` | BIGINT | FK (users.id) | 작성자 ID |
| `content` | TEXT | Not Null | 내용 (HTML 태그 이스케이프 필수 - XSS 방지) |
| `is_secret` | BOOLEAN | Default false | 비밀글 여부 |