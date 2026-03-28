const jwt = require('jsonwebtoken');

/**
 * generateToken — Create a JWT (JSON Web Token) for a user
 * ──────────────────────────────────────────────────────────
 * Called after successful login or registration to give the user a token.
 * The frontend stores this token in localStorage and sends it with every 
 * authenticated request as: Authorization: Bearer <token>
 *
 * WHAT'S IN THE TOKEN:
 *   The token payload only contains { id } — the user's MongoDB ObjectId.
 *   The middleware decodes this to look up the full user on each request.
 *   We intentionally don't store name/email/role in the token — those can change,
 *   and we always want fresh data from the database.
 *
 * HOW JWT WORKS (simplified):
 *   1. We create: header.payload.signature
 *   2. The signature = HMAC-SHA256(header + payload, JWT_SECRET)
 *   3. Anyone can read the payload (it's base64 encoded, not encrypted)
 *   4. But they can't forge a valid signature without knowing JWT_SECRET
 *   5. So we trust: "if signature is valid → we created this token → ID is trustworthy"
 *
 * EXPIRY:
 *   '30d' = 30 days. After this, the token is rejected and the user must log in again.
 *   If JWT_SECRET changes, ALL existing tokens become invalid (everyone gets logged out).
 *
 * @param {string} id - MongoDB ObjectId of the user (student or admin)
 * @returns {string} Signed JWT token string
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },                                            // Payload: just the user ID
        process.env.JWT_SECRET || 'secret123',            // Secret key for signature
        { expiresIn: '30d' }                              // Token expires in 30 days
    );
};

module.exports = generateToken;
