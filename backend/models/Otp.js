const mongoose = require('mongoose');

/**
 * OTP Model — Temporary one-time password storage
 * ──────────────────────────────────────────────────
 * Stores OTPs in MongoDB so they survive across serverless function
 * invocations on Vercel (unlike in-memory Maps which reset on every cold start).
 *
 * AUTOMATIC DELETION (MongoDB TTL Index):
 *   The expireAt field has a TTL (Time-To-Live) index set to `expires: 0`.
 *   This means MongoDB automatically deletes the document when the expireAt
 *   timestamp is reached. No manual cleanup needed.
 *   MongoDB TTL background job runs approximately every 60 seconds,
 *   so there may be a short delay (< 1 min) between expiry and deletion.
 *
 * COMPOUND UNIQUE INDEX:
 *   (email + purpose) must be unique. Enforced by:
 *     otpSchema.index({ email: 1, purpose: 1 }, { unique: true })
 *   This means each user can only have one active OTP per purpose at a time.
 *   When a new OTP is requested, the old one is deleted first (in authService).
 *
 * PURPOSES:
 *   'signup'           → OTP for new account registration (step 2 of sign-up)
 *   'password-change'  → OTP for password update (step 2 of pw change)
 */
const otpSchema = new mongoose.Schema({
    // The email the OTP was sent to
    // Indexed for fast lookup during verification
    email: {
        type: String,
        required: true,
        index: true,
    },

    // Which flow this OTP belongs to
    purpose: {
        type: String,
        required: true,
        enum: ['signup', 'password-change'],
        default: 'signup',
    },

    // The actual 6-digit OTP code (stored as string to preserve leading zeros)
    otp: {
        type: String,
        required: true,
    },

    // When this OTP expires — set to 10 minutes from creation in authService
    // The TTL index on this field causes MongoDB to auto-delete expired documents
    expireAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // Delete the doc when current time >= expireAt
    },
});

// Enforce one active OTP per (email, purpose) pair
// If a user requests two OTPs for the same purpose, the second replaces the first
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model('Otp', otpSchema);
