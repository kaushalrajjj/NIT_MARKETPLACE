const jwt = require('jsonwebtoken');
const jsonDb = require('../config/jsonDb');

/**
 * Resolve a user by ID from either students or admins collection.
 */
const resolveUser = (id) => {
    const user = jsonDb.users.findById(id);
    if (user) return user;
    return jsonDb.admins.findById(id);
};

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            const user = resolveUser(decoded.id);
            if (user) {
                const { password, ...userWithoutPassword } = user;
                req.user = userWithoutPassword;
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const optionalAuth = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            const user = resolveUser(decoded.id);
            if (user) {
                const { password, ...userWithoutPassword } = user;
                req.user = userWithoutPassword;
            }
        } catch (error) {
            // Ignore errors for optional auth
        }
    }
    next();
};

module.exports = { protect, admin, optionalAuth };
