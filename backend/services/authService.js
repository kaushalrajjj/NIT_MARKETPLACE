const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');
const activityRepository = require('../repositories/activityRepository');
const generateToken = require('../config/generateToken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('./emailService');
const Otp = require('../models/Otp');

const authService = {
    /** 
     * Perform Login logic: 
     * Checks both students and admins, verifies password, and generates token. 
     */
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

    /** 
     * Perform Registration logic: 
     * Validates domain, password length, defaults WhatsApp, and hashes password. 
     */
    register: async (userData) => {
        let { name, email, password, rollNo, branch, year, hostel, mobileNo, whatsappNo } = userData;
        email = email ? email.trim() : '';

        if (!email.endsWith('@nitkkr.ac.in')) {
            throw new Error('Only NIT Kurukshetra (@nitkkr.ac.in) emails are allowed.');
        }

        if (!password || password.length < 6 || password.length > 12) {
            throw new Error('Password must be between 6 and 12 characters.');
        }

        if (whatsappNo === undefined && mobileNo !== undefined) {
            whatsappNo = mobileNo;
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
            mobileNo: mobileNo || '',
            whatsappNo: whatsappNo || '',
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
    },
    /** 
     * Generate and email a 6-digit OTP for the given email.
     * Validates domain and duplicate account before sending.
     */
    sendOtp: async (email) => {
        email = email ? email.trim() : '';

        if (!email.endsWith('@nitkkr.ac.in')) {
            throw new Error('Only NIT Kurukshetra (@nitkkr.ac.in) emails are allowed.');
        }

        if (await userRepository.findOne({ email })) {
            throw new Error('User already exists with this email.');
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
        const expireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Upsert: replace any existing OTP for this email with the new one.
        // Using MongoDB instead of in-memory Map so it persists across
        // Vercel serverless function invocations (cold starts).
        await Otp.findOneAndUpdate(
            { email },
            { otp, expireAt },
            { upsert: true, new: true }
        );

        // Await the email — on Vercel serverless the execution context is frozen
        // the moment a response is returned, so fire-and-forget never completes.
        await sendOtpEmail(email, otp);
    },

    /**
     * Verify the OTP and, if valid, register the user.
     */
    verifyOtpAndRegister: async (userData, otp) => {
        const email = userData.email ? userData.email.trim() : '';

        // Read the OTP from MongoDB (works across serverless invocations)
        const record = await Otp.findOne({ email });

        if (!record) {
            throw new Error('No OTP found. Please request a new one.');
        }
        if (Date.now() > record.expireAt.getTime()) {
            await Otp.deleteOne({ email });
            throw new Error('OTP has expired. Please request a new one.');
        }
        if (record.otp !== String(otp).trim()) {
            throw new Error('Invalid OTP. Please try again.');
        }

        // OTP correct — clear it and register
        await Otp.deleteOne({ email });
        return authService.register({ ...userData, email });
    },
};

module.exports = authService;
