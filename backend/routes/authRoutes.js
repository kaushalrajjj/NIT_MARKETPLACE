const express = require('express');
const { login, register, sendOtp, verifyOtpAndRegister, sendPasswordChangeOtp, verifyOtpAndChangePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Authentication Routes (Login/Registration)
router.post('/register', register);
router.post('/login', login); // Single entry for both student and admin login

// OTP-based sign-up routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp-register', verifyOtpAndRegister);

// OTP-based password change routes (requires login)
router.post('/send-password-change-otp', protect, sendPasswordChangeOtp);
router.post('/verify-otp-change-password', protect, verifyOtpAndChangePassword);

module.exports = router;
