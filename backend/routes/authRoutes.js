const express = require('express');
const { login, register } = require('../controllers/authController');
const router = express.Router();

// Authentication Routes (Login/Registration)
// router.post('/register', register); // Disabled for now
router.post('/login', login); // Single entry for both student and admin login

module.exports = router;
