const User = require('../models/User');

const userRepository = {
    // Fetch multiple users matching a query
    find: async (query = {}) => {
        return await User.find(query);
    },

    // Fetch a single user by general query
    findOne: async (query) => {
        return await User.findOne(query);
    },

    // Fetch a single user by MongoDB ID
    findById: async (id) => {
        return await User.findById(id);
    },

    // Create a new user record
    create: async (data) => {
        return await User.create(data);
    },

    // Update an existing user by ID
    update: async (id, data) => {
        return await User.findByIdAndUpdate(id, data, { new: true });
    }
};

module.exports = userRepository;
