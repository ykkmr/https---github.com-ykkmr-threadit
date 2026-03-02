// ASYNC_UPDATES.md §1 — 타이머 기반 폴링 (HTTP Polling)
// 적용: 트렌딩 해시태그 (1~5분 주기), 탭 비활성화 시 자동 정지
import { ref, onMounted, onUnmounted } from 'vue'

const POLL_INTERVAL = 60_000 // 최소 10초 이상 — 1분 설정

export function usePollTrends(fetchFn) {
    const data = ref([])
    let timerId = null

    async function poll() {
        try {
            data.value = await fetchFn()
        } catch (e) {
            console.error('[usePollTrends] fetch error:', e)
        }
    }

    // Page Visibility API — 탭 비활성화 시 타이머 정지
    function onVisibilityChange() {
        if (document.hidden) {
            clearInterval(timerId)
            timerId = null
        } else {
            poll()
            timerId = setInterval(poll, POLL_INTERVAL)
        }
    }

    onMounted(() => {
        poll()
        timerId = setInterval(poll, POLL_INTERVAL)
        document.addEventListener('visibilitychange', onVisibilityChange)
    })

    onUnmounted(() => {
        clearInterval(timerId)
        document.removeEventListener('visibilitychange', onVisibilityChange)
    })

    return { data }
}
