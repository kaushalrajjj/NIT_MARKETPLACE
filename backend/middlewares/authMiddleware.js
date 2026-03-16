const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');

/**
 * Resolve a user by ID from either students or admins collection.
 */
const resolveUser = async (id) => {
    const user = await userRepository.findById(id);
    if (user) return user;
    return await adminRepository.findById(id);
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

            const user = await resolveUser(decoded.id);
            if (user) {
                const userObj = user.toObject ? user.toObject() : user;
                const { password, ...userWithoutPassword } = userObj;
                req.user = userWithoutPassword;
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
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

const optionalAuth = async (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            const user = await resolveUser(decoded.id);
            if (user) {
                const userObj = user.toObject ? user.toObject() : user;
                const { password, ...userWithoutPassword } = userObj;
                req.user = userWithoutPassword;
            }
        } catch (error) {
            // Ignore errors for optional auth
        }
    }
    next();
};

module.exports = { protect, admin, optionalAuth };
