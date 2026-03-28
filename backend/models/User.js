const mongoose = require('mongoose');

/**
 * User (Student) Model — MongoDB Schema for student accounts
 * ─────────────────────────────────────────────────────────────
 * Stored in the 'users' collection.
 * All registered users are students at NIT Kurukshetra.
 * Admin accounts are stored separately in the 'admins' collection.
 *
 * REGISTRATION REQUIREMENTS:
 *   - Email MUST be @nitkkr.ac.in (enforced by regex)
 *   - Roll number: 5-9 digits (NIT KKR format)
 *   - Mobile & WhatsApp: 10 digit Indian numbers (no country code)
 *   - Year: 1-5 (for 4-year BTech + 1-year MTech/PG)
 *   - Branch and hostel are enum-restricted to known NIT KKR values
 *
 * WHAT CAN BE CHANGED AFTER REGISTRATION:
 *   - mobileNo, whatsappNo, secondaryEmail (via PUT /api/users/me)
 *   - password (via OTP-gated flow)
 * 
 * WHAT CANNOT BE CHANGED:
 *   - name, email, rollNo, branch, year, hostel (identity fields — fixed at signup)
 */
const userSchema = new mongoose.Schema({
    // Full name as registered (immutable)
    name: { type: String, required: true },

    // NIT KKR email — primary identifier, used for login and OTP
    // MUST end in @nitkkr.ac.in — enforced by regex
    email: {
        type: String,
        required: true,
        unique: true, // No two students share an email
        match: [/^[a-zA-Z0-9._%+-]+@nitkkr\.ac\.in$/, 'Please use a valid NIT KKR email address']
    },

    // Department/branch (locked at registration, cannot be changed)
    branch: {
        type: String,
        required: true,
        enum: ["CSE", "IT", "ECE", "EE", "ME", "CE", "SET", "ADS", "MNC", "AIML", "PIE", "VLSI", "RA", "IIOT", "BArch"]
    },

    // College roll number — 5-9 digit numeric string (includes old and new formats)
    rollNo: {
        type: String,
        required: true,
        match: [/^[0-9]{5,9}$/, 'Roll number must be between 5 and 9 digits']
    },

    // bcrypt-hashed password — NEVER stored as plain text
    password: { type: String, required: true, minlength: 6 },

    // Primary contact number — 10 digits, no country code (India: +91 implied)
    mobileNo: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'Mobile number must be 10 digits']
    },

    // Academic year — 1 (first year) to 5 (fifth year / dual degree)
    year: { type: Number, required: true, min: 1, max: 5 },

    // Current hostel assignment — affects location shown on listings
    hostel: {
        type: String,
        required: true,
        enum: ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "KALPANA CHAWLA", "BHAGIRATHI", "CAUVERY", "ALAKNANDA"]
    },

    // WhatsApp number — often same as mobileNo, but can differ
    // Shown as a direct WhatsApp button on listings/profile
    whatsappNo: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'WhatsApp number must be 10 digits']
    },

    // Optional personal email (Gmail, Outlook, etc.) for non-NIT contact
    // Not required — some students prefer not to share it
    secondaryEmail: {
        type: String,
        required: false,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please use a valid secondary email address']
    },

    // Role — always 'student' for this collection
    // Kept for potential future use (e.g. student moderators)
    // Admin role is NEVER stored in this collection — admins are in the Admin model
    role: { type: String, default: 'student', enum: ['student', 'admin'] }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const User = mongoose.model('User', userSchema);
module.exports = User;
