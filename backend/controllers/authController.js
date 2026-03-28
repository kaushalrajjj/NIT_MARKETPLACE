const authService = require('../services/authService');

/**
 * authController — HTTP handlers for authentication routes
 * ──────────────────────────────────────────────────────────
 * Controllers are thin layers: they extract request data, call a service,
 * and send back an HTTP response. All actual logic lives in authService.
 *
 * Routes:
 *   POST /api/auth/login                    → login
 *   POST /api/auth/register                 → register (direct — for testing)
 *   POST /api/auth/send-otp                 → sendOtp (step 1 of sign-up)
 *   POST /api/auth/verify-otp-register      → verifyOtpAndRegister (step 2 of sign-up)
 *   POST /api/auth/send-password-change-otp → sendPasswordChangeOtp (step 1 of pw change)
 *   POST /api/auth/verify-otp-change-password → verifyOtpAndChangePassword (step 2 of pw change)
 */

/**
 * Login — Authenticate a student or admin.
 *
 * Checks both collections (students then admins).
 * On success: returns { _id, name, email, role, token, profileImage }
 * On wrong password: returns 401 Unauthorized
 * On server error: returns 500
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const data = await authService.login(email, password);
        res.json(data);
    } catch (error) {
        // Return 401 specifically for auth failures (wrong creds), 500 for everything else
        const isAuthError = error.message === 'Invalid email or password';
        res.status(isAuthError ? 401 : 500).json({ message: error.message });
    }
};

/**
 * Register — Create a new student account directly (skips OTP).
 * Primarily used for testing. In production, users go through the OTP flow.
 * Returns 403 if the email already exists or domain isn't @nitkkr.ac.in.
 */
const register = async (req, res) => {
    try {
        const data = await authService.register(req.body);
        res.status(201).json(data); // 201 = Created
    } catch (error) {
        res.status(403).json({ message: error.message }); // 403 = Forbidden
    }
};

/**
 * sendOtp — Step 1 of OTP-gated sign-up.
 * Validates the email is @nitkkr.ac.in, generates a 6-digit OTP,
 * stores it in the DB with a 10-minute expiry, and emails it to the user.
 */
const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        await authService.sendOtp(email);
        res.json({ message: 'OTP sent successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 = Bad Request (e.g. invalid email domain)
    }
};

/**
 * verifyOtpAndRegister — Step 2 of OTP-gated sign-up.
 * Receives the OTP + all registration data (name, rollNo, branch, etc.).
 * Validates the OTP, then creates the user account.
 * Returns the same login response (user + token) so the frontend can auto-login.
 */
const verifyOtpAndRegister = async (req, res) => {
    const { otp, ...userData } = req.body; // Destructure: separate OTP from user data
    try {
        const data = await authService.verifyOtpAndRegister(userData, otp);
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * sendPasswordChangeOtp — Step 1 of OTP-gated password change.
 * Requires the user to be logged in (protect middleware runs first).
 * Verifies the current password is correct BEFORE sending the OTP —
 * so someone with an open browser session can't silently change the password.
 */
const sendPasswordChangeOtp = async (req, res) => {
    const { currentPassword } = req.body;
    if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required.' });
    }
    try {
        // authService resolves the user from either students or admins collection
        await authService.sendPasswordChangeOtp(req.user._id, currentPassword);
        res.json({ message: 'OTP sent to your registered email.' });
    } catch (error) {
        // 401 for wrong current password, 400 for all other errors
        const status = error.message === 'Current password is incorrect.' ? 401 : 400;
        res.status(status).json({ message: error.message });
    }
};

/**
 * verifyOtpAndChangePassword — Step 2 of OTP-gated password change.
 * Validates the OTP from the database, then hashes and saves the new password.
 * Works for both student and admin accounts via the resolveUserById helper.
 */
const verifyOtpAndChangePassword = async (req, res) => {
    const { otp, newPassword } = req.body;
    if (!otp || !newPassword) {
        return res.status(400).json({ message: 'OTP and new password are required.' });
    }
    try {
        await authService.verifyOtpAndChangePassword(req.user._id, otp, newPassword);
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { login, register, sendOtp, verifyOtpAndRegister, sendPasswordChangeOtp, verifyOtpAndChangePassword };
