const Admin = require('../models/Admin');

const adminRepository = {
    findOne: async (query) => {
        return await Admin.findOne(query);
    },

    findById: async (id) => {
        return await Admin.findById(id);
    },

    create: async (data) => {
        return await Admin.create(data);
    }
};

module.exports = adminRepository;
