import * as SearchService from '../services/search.service.js';

export const search = async (req, res, next) => {
    try {
        const { q, cursor, limit } = req.query;
        const result = await SearchService.searchAll(q, cursor, limit);
        res.status(200).json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};
