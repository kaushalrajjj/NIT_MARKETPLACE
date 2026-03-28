const mongoose = require('mongoose');

/**
 * Admin Model — MongoDB Schema for administrator accounts
 * ──────────────────────────────────────────────────────────
 * Stored in a SEPARATE 'admins' collection (NOT the 'users' collection).
 * This deliberate separation means:
 *   1. Admins cannot be browsed as "sellers" on the marketplace
 *   2. Admin credentials are isolated from student data
 *   3. Compromising the students DB doesn't expose admin accounts
 *
 * IMPORTANT NOTES:
 *   - There is NO 'role' field here. The 'admin' role is attached manually
 *     in authMiddleware.js at request time: adminObj.role = 'admin'
 *   - Admin emails are NOT restricted to @nitkkr.ac.in (unlike students)
 *   - Admin accounts must be created manually — no public registration
 *   - Password minlength is 6 (matches the app's 6-12 char policy enforced in controllers)
 *
 * CREATING AN ADMIN:
 *   Run a one-off script against your DB (see DevNotes for examples).
 *   Make sure to bcrypt-hash the password before inserting.
 */
const adminSchema = new mongoose.Schema({
    // Admin's full name — shown in the admin panel header
    name: { type: String, required: true },

    // Admin's email — used for login and OTP delivery
    // Can be any valid email (Gmail, etc.) unlike student emails (@nitkkr.ac.in)
    email: {
        type: String,
        required: true,
        unique: true, // No two admins can share an email
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please use a valid email address']
    },

    // bcrypt-hashed password — NEVER stored as plain text
    // minlength: 6 matches the controller's validation (6-12 characters allowed)
    // NOTE: This was previously 12 — reduced to 6 to match the app's enforced policy
    password: { type: String, required: true, minlength: 6 },

    // Admin's contact phone number in Indian format (+91 followed by 10 digits)
    phone: {
        type: String,
        required: true,
        match: [/^\+91 [0-9]{10}$/, 'Phone number must be in format +91 1234567890']
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
