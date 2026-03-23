const authService = require('../services/authService');

/**
 * Authenticate student or admin and return a JWT token.
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const data = await authService.login(email, password);
        res.json(data);
    } catch (error) {
        const isAuthError = error.message === 'Invalid email or password';
        res.status(isAuthError ? 401 : 500).json({ message: error.message });
    }
};

/**
 * Register a new student account.
 */
const register = async (req, res) => {
    try {
        const data = await authService.register(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

module.exports = { login, register };
