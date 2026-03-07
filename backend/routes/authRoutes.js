const express = require('express');
const { authUser, registerUser } = require('../handlers/authHandler');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);

module.exports = router;
