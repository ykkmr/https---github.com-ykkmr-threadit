import { ref } from 'vue'
import { getThreads } from '../api/index.js'

// ASYNC_UPDATES.md: 낙관적 업데이트 + 커서 기반 무한 스크롤
export function useThreads() {
    const threads = ref([])
    const nextCursor = ref(null)
    const loading = ref(false)
    const hasMore = ref(true)

    async function loadMore() {
        if (loading.value || !hasMore.value) return
        loading.value = true
        try {
            const { data } = await getThreads(nextCursor.value)
            threads.value.push(...data.data)
            nextCursor.value = data.nextCursor
            hasMore.value = !!data.nextCursor
        } catch (e) {
            console.error('[useThreads] loadMore error:', e)
        } finally {
            loading.value = false
        }
    }

    // 낙관적 업데이트: 서버 응답 전 즉시 반영 (실패 시 롤백은 호출 측에서 처리)
    function prependThread(thread) {
        threads.value.unshift(thread)
    }

    return { threads, nextCursor, loading, hasMore, loadMore, prependThread }
}
