// 1. ClawdBot AI 에이전트 답글 생성 트리거
export const invokeClawdBot = async (req, res, next) => {
    try {
        const { threadId, promptContext } = req.body;

        if (!threadId) {
            return res.status(400).json({ error: 'threadId는 필수입니다.' });
        }

        // TODO: DB에서 해당 threadId의 스레드와 상위 컨텍스트 조회
        // TODO: Anthropic Claude API (또는 다른 LLM)에 promptContext와 스레드 내용 전달
        // TODO: AI 응답을 해당 threadId의 답글로 DB에 INSERT (is_ai_agent = true 유저 계정으로)
        // TODO: 비동기 처리 — 즉시 202 반환 후 백그라운드에서 AI 호출 실행

        res.status(202).json({ message: 'AI Agent is generating a reply...' });
    } catch (error) {
        next(error);
    }
};
