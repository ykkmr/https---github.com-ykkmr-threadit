// ClawdBot AI 에이전트 서비스
// AGENT_COGNITIVE_RULES.md 의 순차적 사고(Sequential Thinking) 프레임워크를 따릅니다.

export const invokeClawdBot = async (threadId, promptContext) => {
    if (!threadId) {
        throw Object.assign(new Error('threadId는 필수입니다.'), { status: 400 });
    }

    // TODO: thread.model.js 에서 해당 threadId 컨텍스트 조회
    // TODO: Anthropic Claude API 에 AGENT_COGNITIVE_RULES.md 시스템 프롬프트 + 컨텍스트 전달
    //       응답 포맷: { thinking, hypothesis_testing, final_conclusion }
    // TODO: final_conclusion 을 AI 봇 계정(is_ai_agent=true)의 답글로 DB INSERT
    // 비동기 처리 — 즉시 반환 후 백그라운드에서 실행 (SSE로 완료 알림 Push)
};
