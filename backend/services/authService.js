const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');
const activityRepository = require('../repositories/activityRepository');
const generateToken = require('../config/generateToken');
const bcrypt = require('bcryptjs');

const authService = {
    login: async (email, password) => {
        const trimmedEmail = email ? email.trim() : '';
        // Check students first, then admins
        let user = await userRepository.findOne({ email: trimmedEmail });
        let isAdmin = false;

        if (!user) {
            user = await adminRepository.findOne({ email: trimmedEmail });
            isAdmin = !!user;
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            const activity = await activityRepository.getOrCreate(user._id);
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                rollNo: user.rollNo || null,
                role: user.role || (isAdmin ? 'admin' : 'student'),
                profileImage: activity.img || null,
                token: generateToken(user._id),
            };
        }

        throw new Error('Invalid email or password');
    },

    register: async (userData) => {
        let { name, email, password, rollNo, branch, year, hostel } = userData;
        email = email ? email.trim() : '';

        if (!email.endsWith('@nitkkr.ac.in')) {
            throw new Error('Only NIT Kurukshetra (@nitkkr.ac.in) emails are allowed.');
        }

        if (await userRepository.findOne({ email })) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userRepository.create({
            name,
            email,
            password: hashedPassword,
            rollNo: rollNo || '',
            branch: branch || '',
            year: year || null,
            hostel: hostel || '',
            role: 'student',
            mobileNo: '',
            whatsappNo: '',
        });

        if (user) {
            await activityRepository.getOrCreate(user._id);
            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                rollNo: user.rollNo || '',
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

