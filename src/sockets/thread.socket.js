// SSE (Server-Sent Events) 핸들러 — ASYNC_UPDATES.md 기준
// 적용 대상: 실시간 답글 피드, 좋아요 카운트, ClawdBot 타이핑 상태

const clients = new Map(); // Map<userId, res>

export const sseConnect = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const userId = req.user?.id ?? `anon-${Date.now()}`;
    clients.set(userId, res);

    req.on('close', () => {
        clients.delete(userId);
    });
};

// 특정 유저 또는 전체 클라이언트에 이벤트 Push
export const emit = (event, data, targetUserId = null) => {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    if (targetUserId) {
        const res = clients.get(targetUserId);
        if (res) res.write(payload);
    } else {
        clients.forEach(res => res.write(payload));
    }
};
