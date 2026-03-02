import * as AuthService from '../services/auth.service.js';

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        await AuthService.registerUser(username, email, password);
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await AuthService.loginUser(email, password);
        res.status(200).json({ token });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
};
