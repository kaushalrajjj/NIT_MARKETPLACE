const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');

/**
 * Resolve a user by ID from either students or admins collection.
 */
const resolveUser = async (id) => {
    const user = await userRepository.findById(id);
    if (user) return user;
    const adminUser = await adminRepository.findById(id);
    if (adminUser) {
        // Admin model has no 'role' field, so we attach it manually
        const adminObj = adminUser.toObject ? adminUser.toObject() : { ...adminUser };
        adminObj.role = 'admin';
        return adminObj;
    }
    return null;
};

/** 
 * Enforce Authentication:
 * Verifies JWT token and attaches user object (without password) to req.user.
 * Rejects request with 401 if token is missing or invalid.
 */
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
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found', redirect: '/auth' });
            }

            const userObj = user.toObject ? user.toObject() : user;
            const { password, ...userWithoutPassword } = userObj;
            req.user = userWithoutPassword;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed', redirect: '/auth' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token', redirect: '/auth' });
    }
};

/** 
 * Enforce Admin Role:
 * Ensures the authenticated user has the 'admin' role.
 * Rejects request with 401 if user is not an admin.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

/** 
 * Optional Authentication:
 * If a valid token exists, attaches user object to req.user.
 * Does NOT reject if token missing or invalid; just continues without req.user.
 * Useful for tailoring responses for logged-in vs guest users.
 */
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
