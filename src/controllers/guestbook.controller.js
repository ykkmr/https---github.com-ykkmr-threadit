import * as GuestbookService from '../services/guestbook.service.js';

export const getGuestbook = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const viewerId = req.user?.id ?? null;
        const data = await GuestbookService.getGuestbook(userId, viewerId);
        res.status(200).json({ data });
    } catch (error) {
        next(error);
    }
};

export const writeGuestbook = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { content, parentId, isSecret } = req.body;
        const id = await GuestbookService.writeGuestbook(userId, req.user.id, content, parentId, isSecret);
        res.status(201).json({ id, message: 'Guestbook entry created.' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};

export const deleteGuestbook = async (req, res, next) => {
    try {
        await GuestbookService.removeGuestbook(req.params.id, req.user.id);
        res.status(200).json({ message: 'Guestbook entry deleted.' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};
