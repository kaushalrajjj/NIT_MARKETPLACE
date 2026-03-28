const Admin = require('../models/Admin');

/**
 * adminRepository — Database queries for the Admins collection
 * ─────────────────────────────────────────────────────────────
 * Admins are stored in a SEPARATE MongoDB collection from students.
 * This repository is the ONLY place that should directly query the Admin model.
 *
 * IMPORTANT NOTES:
 *   1. Admin documents do NOT have a 'role' field — it's attached manually
 *      in authMiddleware.resolveUser() as adminObj.role = 'admin'
 *   2. update() uses { new: true } (Mongoose option) NOT { returnDocument: 'after' }
 *      (which is a MongoDB driver option and won't work with Mongoose's findByIdAndUpdate)
 *   3. Admin accounts must be created manually (no public registration endpoint)
 */
const adminRepository = {
    /**
     * findOne — Find a single admin by any field.
     * Most commonly used for login: findOne({ email: '...' })
     *
     * @param {Object} query - Any Mongoose query object
     * @returns {Document|null} Mongoose Admin document or null
     */
    findOne: async (query) => {
        return await Admin.findOne(query);
    },

    /**
     * findById — Find an admin by their MongoDB _id.
     * Called by authMiddleware to resolve admin from JWT.
     * Called by authService.resolveUserById() during password change.
     *
     * @param {string|ObjectId} id - MongoDB ObjectId
     * @returns {Document|null} Admin document or null
     */
    findById: async (id) => {
        return await Admin.findById(id);
    },

    /**
     * create — Create a new admin account.
     * NOT exposed via any public API route.
     * Admins must be created manually (script, DB client, or separate admin tool).
     *
     * NOTE: Password should be bcrypt-hashed BEFORE calling this.
     *
     * @param {Object} data - { name, email, password (hashed), phone }
     * @returns {Document} Created Admin document
     */
    create: async (data) => {
        return await Admin.create(data);
    },

    /**
     * update — Update an admin's fields by ID.
     *
     * Uses { new: true } which is Mongoose's option to return the UPDATED document.
     * Without this, Mongoose returns the OLD document (before the update).
     *
     * Common use cases:
     *   - Changing password: update(id, { password: hashedNewPassword })
     *   - Updating contact: update(id, { phone: '...' })
     *
     * @param {string|ObjectId} id   - Admin's MongoDB _id
     * @param {Object}          data - Fields to update
     * @returns {Document|null} Updated Admin document
     */
    update: async (id, data) => {
        return await Admin.findByIdAndUpdate(id, data, { new: true });
    }
};

module.exports = adminRepository;
