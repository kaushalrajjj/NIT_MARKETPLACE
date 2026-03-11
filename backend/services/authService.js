const jsonDb = require('../config/jsonDb');
const activityRepository = require('../repositories/activityRepository');
const generateToken = require('../config/generateToken');
const bcrypt = require('bcryptjs');

const authService = {
    login: async (email, password) => {
        // Check students first, then admins
        let user = jsonDb.users.findOne({ email });
        let isAdmin = false;

        if (!user) {
            user = jsonDb.admins.findOne({ email });
            isAdmin = !!user;
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const activity = activityRepository.getOrCreate(user._id);
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                roll: user.roll || null,
                role: user.role || (isAdmin ? 'admin' : 'student'),
                profileImage: activity.img || null,
                token: generateToken(user._id),
            };
        }

        throw new Error('Invalid email or password');
    },

    register: async (userData) => {
        const { name, email, password, roll, branch, year, currentHostel } = userData;

        if (!email.endsWith('@nitkkr.ac.in')) {
            throw new Error('Only NIT Kurukshetra (@nitkkr.ac.in) emails are allowed.');
        }

        if (jsonDb.users.findOne({ email })) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = jsonDb.users.create({
            name,
            email,
            password: hashedPassword,
            roll: roll || '',
            branch: branch || '',
            year: year || null,
            currentHostel: currentHostel || '',
            role: 'student',
            phone: '',
            whatsapp: '',
            secondaryEmail: ''
        });

        if (user) {
            activityRepository.getOrCreate(user._id);
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                roll: user.roll || '',
                role: user.role,
                profileImage: null,
                token: generateToken(user._id),
            };
        } else {
            throw new Error('Invalid user data');
        }
    }
};

module.exports = authService;

