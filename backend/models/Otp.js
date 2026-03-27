const mongoose = require('mongoose');

/**
 * OTP Model
 * Stores one-time passwords temporarily in MongoDB.
 * The `expireAt` field uses a TTL index — MongoDB automatically
 * deletes the document when `expireAt` time has passed.
 * This replaces the in-memory Map which doesn't survive across
 * Vercel serverless function invocations.
 *
 * The `purpose` field distinguishes OTPs for different flows:
 *   'signup'          — used during new account registration
 *   'password-change' — used during password update
 */
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    purpose: {
        type: String,
        required: true,
        enum: ['signup', 'password-change'],
        default: 'signup',
    },
    otp: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        required: true,
        // MongoDB TTL index: automatically deletes this document when expireAt is reached
        index: { expires: 0 },
    },
});

// Compound unique index: one active OTP per (email, purpose) pair at a time
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model('Otp', otpSchema);
