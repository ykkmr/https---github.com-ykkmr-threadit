// MASTER_ARCHITECTURE_RULES.md: Single Source of Truth — 전역 UI 상태
// Toast 알림: 낙관적 업데이트 실패 시 롤백 알림에 사용
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const toasts = ref([])

    function showToast(message, type = 'error') {
        const id = Date.now()
        toasts.value.push({ id, message, type })
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id)
        }, 3000)
    }

    // MASTER_ARCHITECTURE_RULES.md §2.3: 비동기 에러 시 "동기화 실패" 토스트 + 롤백
    function showSyncError() {
        showToast('동기화 실패: 네트워크를 확인해주세요.', 'error')
    }

    return { toasts, showToast, showSyncError }
})
