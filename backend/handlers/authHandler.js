const jsonDb = require('../config/jsonDb');
const generateToken = require('../config/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = jsonDb.users.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @desc    Register a new user (Disabled for public)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    res.status(403).json({ message: 'Public registration is disabled. Please contact your admin for access.' });
};

module.exports = { authUser, registerUser };
