import * as ThreadService from '../services/thread.service.js';

export const getThreads = async (req, res, next) => {
    try {
        const { cursor, limit } = req.query;
        const result = await ThreadService.getRootThreads(cursor, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getThreadTree = async (req, res, next) => {
    try {
        const tree = await ThreadService.getThreadTree(req.params.id);
        if (!tree) return res.status(404).json({ error: '스레드를 찾을 수 없습니다.' });
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};

export const createThread = async (req, res, next) => {
    try {
        const { content, parentId } = req.body;
        const id = await ThreadService.createThread(req.user.id, content, parentId);
        res.status(201).json({ id, message: 'Thread created.' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};

export const deleteThread = async (req, res, next) => {
    try {
        await ThreadService.deleteThread(req.params.id, req.user.id);
        res.status(200).json({ message: 'Thread deleted.' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};

export const toggleLike = async (req, res, next) => {
    try {
        const result = await ThreadService.toggleLike(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
