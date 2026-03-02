<!-- MASTER_ARCHITECTURE_RULES.md §2.3 — 비동기 에러 시 Toast 알림
     - 낙관적 업데이트 실패 → "동기화 실패: 네트워크를 확인해주세요." + 롤백
     - stores/ui.js 의 toasts 배열을 구독
-->
<script setup>
import { useUIStore } from '../../stores/ui.js'
const ui = useUIStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  background: #1a1a1a;
  color: #fff;
  white-space: nowrap;
}
.toast.error { background: #c00; }
.toast.success { background: #090; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
