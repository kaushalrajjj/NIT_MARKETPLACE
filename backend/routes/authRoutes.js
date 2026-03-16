const express = require('express');
const { login, register } = require('../controllers/authController');
const router = express.Router();

// router.post('/register', register); // Disabled as per request
router.post('/login', login);

module.exports = router;
