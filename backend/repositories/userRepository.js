const User = require('../models/User');

/**
 * userRepository — Database queries for the Students (users) collection
 * ────────────────────────────────────────────────────────────────────────
 * Students are stored in the 'users' MongoDB collection.
 * This is the ONLY file that directly queries the User model.
 *
 * IMPORTANT:
 *   update() still uses { returnDocument: 'after' } which is a MongoDB driver option,
 *   NOT a Mongoose option. This means findByIdAndUpdate may return the OLD document.
 *   For consistency, this should be changed to { new: true } (see adminRepository).
 *   However, changing it might affect places that rely on the current behavior.
 */
const userRepository = {
    /**
     * find — Get multiple users matching a query.
     * Called with {} to get ALL users (admin stats, admin user list).
     *
     * @param {Object} query - Mongoose filter (e.g. { branch: 'CSE' })
     * @returns {Document[]} Array of User documents
     */
    find: async (query = {}) => {
        return await User.find(query);
    },

    /**
     * findOne — Get a single user by any field.
     * Most commonly used for login: findOne({ email: '...' })
     *
     * @param {Object} query - Any Mongoose query object
     * @returns {Document|null} User document or null if not found
     */
    findOne: async (query) => {
        return await User.findOne(query);
    },

    /**
     * findById — Get a single student by MongoDB _id.
     * Called by authMiddleware, authService, and productService
     * to resolve the seller's full profile when needed.
     *
     * @param {string|ObjectId} id - MongoDB ObjectId
     * @returns {Document|null} User document or null
     */
    findById: async (id) => {
        return await User.findById(id);
    },

    /**
     * create — Register a new student account.
     * Called by authService.register() after OTP verification.
     * Password should be bcrypt-hashed before calling this.
     *
     * @param {Object} data - Full user registration data
     * @returns {Document} Newly created User document
     */
    create: async (data) => {
        return await User.create(data);
    },

    /**
     * update — Update a student's fields by ID.
     *
     * NOTE: Uses { returnDocument: 'after' } which is a MongoDB driver option.
     * In Mongoose, the equivalent is { new: true }.
     * This MAY return the old document in some Mongoose versions.
     * If profile updates seem to return stale data, change to { new: true }.
     *
     * @param {string|ObjectId} id   - Student's MongoDB _id
     * @param {Object}          data - Fields to update
     * @returns {Document|null} Updated User document (or possibly old one — see note)
     */
    update: async (id, data) => {
        return await User.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    }
};

module.exports = userRepository;
