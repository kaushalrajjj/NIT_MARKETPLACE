const express = require('express');
const { login, register, sendOtp, verifyOtpAndRegister } = require('../controllers/authController');
const router = express.Router();

// Authentication Routes (Login/Registration)
router.post('/register', register);
router.post('/login', login); // Single entry for both student and admin login

// OTP-based sign-up routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp-register', verifyOtpAndRegister);

module.exports = router;
