// CONTENT_AND_FILE_RULES.md: 상대 시간 표기 원칙
// 기본: '3분 전' / 마우스 오버: 'YYYY-MM-DD HH:mm:ss'

export function useTimeAgo() {
    function timeAgo(isoString) {
        const diff = (Date.now() - new Date(isoString)) / 1000
        if (diff < 60) return '방금 전'
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
        if (diff < 172800) return '어제'
        return `${Math.floor(diff / 86400)}일 전`
    }

    function exactDate(isoString) {
        const d = new Date(isoString)
        const pad = (n) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }

    return { timeAgo, exactDate }
}
