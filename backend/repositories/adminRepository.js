const Admin = require('../models/Admin');

const adminRepository = {
    // Find a single administrator by general query
    findOne: async (query) => {
        return await Admin.findOne(query);
    },

    // Get an admin by their MongoDB ID
    findById: async (id) => {
        return await Admin.findById(id);
    },

    // Create a new administrator account (rarely used)
    create: async (data) => {
        return await Admin.create(data);
    },

    // Update an existing administrator by ID
    update: async (id, data) => {
        return await Admin.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    }
};

module.exports = adminRepository;
