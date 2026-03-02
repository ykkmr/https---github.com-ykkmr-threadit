// FEATURE_RULES.md §1 — 검색 (300~500ms 디바운싱 필수)
import { ref } from 'vue'

const DEBOUNCE_MS = 300
const MIN_LENGTH = 2

export function useSearch(apiFn) {
    const results = ref({ threads: [], users: [], nextCursor: null })
    const loading = ref(false)
    let debounceTimer = null

    function search(keyword, cursor = null) {
        clearTimeout(debounceTimer)
        if (!keyword || keyword.length < MIN_LENGTH) {
            results.value = { threads: [], users: [], nextCursor: null }
            return
        }

        debounceTimer = setTimeout(async () => {
            loading.value = true
            try {
                const data = await apiFn(keyword, cursor)
                results.value = data
            } catch (e) {
                console.error('[useSearch] error:', e)
            } finally {
                loading.value = false
            }
        }, DEBOUNCE_MS)
    }

    return { results, loading, search }
}
