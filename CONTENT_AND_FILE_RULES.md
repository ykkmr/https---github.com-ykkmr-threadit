# 📦 Core Content & File Convention Rules

본 문서는 프로젝트의 '알맹이(Core Data)'를 어떻게 취급할 것인지에 대한 구조적 제약과, 협업 시 헷갈리지 않도록 모든 파일의 이름과 위치를 강제하는 명확한 규칙을 정의합니다.

## 1. UI/UX 데이터 표기 룰 (Data Display)

스레드 커뮤니티 특성상 시간과 데이터의 흐름을 직관적으로 보여주는 것이 핵심입니다.

### 1.1. 시간 표기 원칙 (Relative & Absolute Time)
- **기본 노출 (상대 시간):** 스레드나 방명록의 작성 시간은 UI의 간결성을 위해 항상 **'상대 시간'**으로 표기합니다. (예: `방금 전`, `3분 전`, `2시간 전`, `어제`)
- **마우스 오버 (절대 시간):** 사용자가 상대 시간 텍스트에 마우스 오버(Hover)했을 때, 브라우저 기본 툴팁(`title` 속성)이나 커스텀 툴팁을 통해 **'정확한 등록 날짜와 시간'**을 보여주어야 합니다.
  - *형식:* `YYYY-MM-DD HH:mm:ss` (예: `2026-03-02 18:54:23`)
- **코드 예시 (Vue 3):**
  ```html
  <span class="time-relative" :title="exactDate(thread.createdAt)">
    {{ timeAgo(thread.createdAt) }}
  </span>


## 2. 알맹이(Core Data) 구조 통제 룰
데이터의 본질(알맹이)이 오염되지 않도록 프론트엔드와 백엔드 양측에서 명확한 툴과 검증(Validation) 규칙을 강제합니다.

### 2.1. 필수(Required) vs 선택(Optional) 데이터 통제
스레드 (Thread): author_id와 content는 절대 비어있을 수 없는(Null 불가) 핵심 알맹이입니다. 빈 스레드 전송은 프론트엔드 작성 버튼 단에서부터 철저히 막아야 합니다. (최소 1자 이상)

신디사이저 패치 (Patch): nodes(모듈 정보)와 edges(연결선 정보)가 알맹이입니다. 단 하나의 모듈도 없는 빈 캔버스 상태로는 '저장' 버튼이 비활성화되어야 합니다.

### 2.2. 데이터 세니타이징 (Sanitizing)
사용자가 입력하는 모든 텍스트(알맹이)는 XSS 공격을 막기 위해 렌더링 시 반드시 이스케이프(Escape) 처리되어야 합니다.

Vue 3에서는 기본적으로 {{ }} 콧수염 문법이 이스케이프를 지원하므로 안전하지만, 포맷팅을 위해 v-html 디렉티브를 사용해야 할 경우 반드시 DOMPurify 같은 외부 라이브러리를 통해 알맹이를 소독한 후 렌더링해야 합니다.

## 3. 파일 및 네이밍 컨벤션 (File & Naming Rules)
파일 이름만 봐도 이 파일이 어떤 역할을 하는지, 어떤 알맹이를 담고 있는지 파악할 수 있어야 합니다.

### 3.1. 프론트엔드 (Vue 3) 네이밍 규칙
Components (/src/components/): PascalCase 적용. 여러 단어를 조합하여 구체적으로 작성합니다.

✅ ThreadItem.vue, SynthKnob.vue, UserProfile.vue

❌ thread.vue, item.vue

Views/Pages (/src/views/): 라우터에 연결되는 최상위 페이지 컴포넌트는 끝에 반드시 View를 붙입니다.

✅ HomeView.vue, ThreadDetailView.vue, SynthBuilderView.vue

Composables (/src/composables/): 재사용 가능한 상태 로직(Vue Hook)은 camelCase를 쓰며, 반드시 use로 시작합니다.

✅ useAuth.js, useTimeAgo.js, useAudioEngine.js

Assets (/src/assets/): 이미지, CSS 파일 등은 띄어쓰기나 대문자 대신 하이픈을 쓰는 kebab-case를 사용합니다.

✅ default-avatar.png, synth-bg-dark.css

### 3.2. 백엔드 (Node.js) 네이밍 규칙
모듈 분리 명확화: 역할에 따라 파일명 뒤에 접미사를 붙여(kebab-case 형식) 파일의 성격을 명시합니다.

라우터: thread.routes.js, auth.routes.js

컨트롤러: thread.controller.js, auth.controller.js

서비스(비즈니스 로직): thread.service.js

모델/스키마: thread.model.js

### 3.3. 임포트 (Import) 절대 경로 규칙
파일을 불러올 때 상대 경로(../../../../)가 깊어지는 것을 방지하기 위해, Vite 및 Node.js 설정에서 @ 기호를 src 폴더의 절대 경로로 매핑(Alias)하여 사용합니다.

✅ import ThreadItem from '@/components/thread/ThreadItem.vue'

❌ import ThreadItem from '../../../components/thread/ThreadItem.vue'