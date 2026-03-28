const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');   // Students collection
const adminRepository = require('../repositories/adminRepository'); // Admins collection

/**
 * resolveUser — Find a user by ID from EITHER collection
 * ────────────────────────────────────────────────────────
 * We have two separate MongoDB collections: 'users' (students) and 'admins'.
 * The JWT token only stores the user's _id — not whether they're a student or admin.
 * So we check students first, then admins.
 *
 * @param {string} id - MongoDB ObjectId from the decoded JWT
 * @returns the user document (plain object) with role attached, or null if not found
 */
const resolveUser = async (id) => {
    // Try to find the ID in the students collection first
    const user = await userRepository.findById(id);
    if (user) return user; // found a student — return immediately

    // Not a student — try the admins collection
    const adminUser = await adminRepository.findById(id);
    if (adminUser) {
        // Admin documents don't have a 'role' field in their schema,
        // so we manually attach it before returning
        const adminObj = adminUser.toObject ? adminUser.toObject() : { ...adminUser };
        adminObj.role = 'admin';
        return adminObj;
    }

    return null; // ID not found in either collection
};


/**
 * protect — Authentication Middleware
 * ─────────────────────────────────────
 * Guards any route that requires the user to be logged in.
 *
 * HOW IT WORKS:
 *   1. Reads the JWT token from the Authorization header
 *   2. Verifies the token signature (catches expired or tampered tokens)
 *   3. Extracts the user ID from the token payload
 *   4. Looks up the full user record from the DB
 *   5. Strips the password field (never expose it)
 *   6. Attaches the user to req.user so the controller can use it
 *   7. Calls next() to continue to the controller
 *
 * USAGE in routes:
 *   router.get('/me', protect, getMe);  ← protect runs before getMe
 */
const protect = async (req, res, next) => {
    let token;

    // JWT tokens are sent in the Authorization header as "Bearer <token>"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract just the token part (after "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token — this will throw if the token is expired or tampered
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Look up the actual user record by the ID stored in the token
            const user = await resolveUser(decoded.id);
            if (!user) {
                return res.status(401).json({ 
                    message: 'Not authorized, user not found', 
                    redirect: '/auth' 
                });
            }

            // Convert Mongoose document to plain JS object, then remove the password
            // We NEVER want to accidentally send the password hash in any response
            const userObj = user.toObject ? user.toObject() : user;
            const { password, ...userWithoutPassword } = userObj;

            // Attach the safe user object — controllers access it via req.user
            req.user = userWithoutPassword;

            next(); // Everything checks out — proceed to the controller
        } catch (error) {
            console.error(error);
            // Token is invalid (wrong signature, expired, etc.)
            res.status(401).json({ 
                message: 'Not authorized, token failed', 
                redirect: '/auth' 
            });
        }
    } else {
        // No Authorization header was sent at all
        res.status(401).json({ 
            message: 'Not authorized, no token', 
            redirect: '/auth' 
        });
    }
};


/**
 * admin — Admin Role Middleware
 * ──────────────────────────────
 * Must be used AFTER protect (because protect sets req.user).
 * Blocks the request if the logged-in user is not an admin.
 *
 * USAGE in routes:
 *   router.delete('/product/:id', protect, admin, deleteProduct);
 *   ← protect runs first (verifies login), admin runs second (verifies role)
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin — allow the request
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};


/**
 * optionalAuth — Soft Authentication Middleware
 * ───────────────────────────────────────────────
 * Like protect, but does NOT reject the request if the token is missing or invalid.
 * Instead, it just skips attaching req.user.
 *
 * WHY: Some routes behave differently for logged-in vs guest users.
 * Example: GET /api/products can show wishlisted state for logged-in users,
 * but still works fine for guests (just without that feature).
 *
 * USAGE in routes:
 *   router.get('/products', optionalAuth, getProducts);
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
            // Silently ignore errors — this is optional auth, not required
        }
    }
    next(); // Always continue, even if no/invalid token
};

module.exports = { protect, admin, optionalAuth };
