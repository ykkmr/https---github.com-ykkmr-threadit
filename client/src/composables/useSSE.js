// ASYNC_UPDATES.md §2 — SSE (Server-Sent Events)
// 적용: 실시간 답글 피드, 좋아요 카운트, ClawdBot 타이핑 상태
import { onUnmounted } from 'vue'

export function useSSE(onEvent) {
    let eventSource = null

    function connect() {
        if (eventSource) return
        eventSource = new EventSource('/api/v1/sse/connect', { withCredentials: true })

        eventSource.addEventListener('NEW_REPLY', (e) => {
            onEvent?.('NEW_REPLY', JSON.parse(e.data))
        })
        eventSource.addEventListener('LIKE_UPDATE', (e) => {
            onEvent?.('LIKE_UPDATE', JSON.parse(e.data))
        })
        eventSource.addEventListener('BOT_TYPING', (e) => {
            onEvent?.('BOT_TYPING', JSON.parse(e.data))
        })

        // 브라우저가 끊김 시 자동 재연결 — 서버측 재연결 처리 필요 (thread.socket.js 참조)
        eventSource.onerror = () => {
            eventSource?.close()
            eventSource = null
        }
    }

    function disconnect() {
        eventSource?.close()
        eventSource = null
    }

    onUnmounted(disconnect)

    return { connect, disconnect }
}
