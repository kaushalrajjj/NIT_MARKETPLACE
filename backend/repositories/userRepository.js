const User = require('../models/User');

const userRepository = {
    find: async (query = {}) => {
        return await User.find(query);
    },

    findOne: async (query) => {
        return await User.findOne(query);
    },

    findById: async (id) => {
        return await User.findById(id);
    },

    create: async (data) => {
        return await User.create(data);
    },

    update: async (id, data) => {
        return await User.findByIdAndUpdate(id, data, { new: true });
    }
};

module.exports = userRepository;
