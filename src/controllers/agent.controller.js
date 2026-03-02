import * as AgentService from '../services/agent.service.js';

export const invokeClawdBot = async (req, res, next) => {
    try {
        const { threadId, promptContext } = req.body;
        await AgentService.invokeClawdBot(threadId, promptContext);
        res.status(202).json({ message: 'AI Agent is generating a reply...' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};
