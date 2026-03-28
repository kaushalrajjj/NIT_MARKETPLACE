const userRepository = require('../repositories/userRepository');
const adminRepository = require('../repositories/adminRepository');
const productRepository = require('../repositories/productRepository');

/**
 * userService — Business logic for user profile management
 * ──────────────────────────────────────────────────────────
 * Handles operations that span both the students and admins collections,
 * abstracting the "check student first, then admin" pattern into one place.
 */
const userService = {
    /**
     * getPublicStats — Platform statistics shown on the landing page.
     *
     * These numbers are shown publicly to all visitors (no auth required).
     * "happyTraders" is a derived stat: 95% of registered users, rounded down.
     * It's a marketing number — not a precise metric.
     *
     * @returns {{ totalStudents, totalListings, happyTraders }}
     */
    getPublicStats: async () => {
        const users = await userRepository.find();
        // Only count approved products for "active listings" metric
        const products = await productRepository.find({ isApproved: true });
        return {
            totalStudents: users.length,
            totalListings: products.length,
            happyTraders: Math.floor(users.length * 0.95) // Derived marketing stat
        };
    },

    /**
     * getUserById — Find a user by ID from students OR admins.
     *
     * This is needed because multiple parts of the app need to look up
     * a user without knowing which collection they're in.
     *
     * Used by:
     *   - productService: when resolving actionByAdmin to get admin's name
     *   - authController: for the legacy direct changePassword route
     *
     * @param {string|ObjectId} id - MongoDB ObjectId
     * @returns {Document|null} User or Admin document, or null
     */
    getUserById: async (id) => {
        const student = await userRepository.findById(id);
        if (student) return student; // Found in students collection → return immediately
        return await adminRepository.findById(id); // Try admins collection
    },

    /**
     * updateUserProfile — Update editable fields for a student or admin.
     *
     * Tries the students collection first. If the user isn't found there
     * (i.e. they're an admin), falls back to the admins collection.
     *
     * Common fields updated:
     *   - Students: mobileNo, whatsappNo, secondaryEmail, password (hashed)
     *   - Admins: password (hashed)
     *
     * @param {string|ObjectId} userId      - The user's MongoDB _id
     * @param {Object}          profileData - Fields to patch
     * @returns {Document|null} Updated document or null if not found
     */
    updateUserProfile: async (userId, profileData) => {
        // Try updating in students collection first
        const student = await userRepository.update(userId, profileData);
        if (student) return student;

        // Not a student — try admins collection
        return await adminRepository.update(userId, profileData);
    }
};

module.exports = userService;
