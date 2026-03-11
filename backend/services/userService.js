const jsonDb = require('../config/jsonDb');
const productRepository = require('../repositories/productRepository');

const userService = {
    getPublicStats: async () => {
        const users = jsonDb.users.find();
        const products = productRepository.find({ isApproved: true });
        return {
            totalStudents: users.length,
            totalListings: products.length,
            happyTraders: Math.floor(users.length * 0.95)
        };
    },

    getUserById: async (id) => {
        return jsonDb.users.findById(id);
    },

    updateUserProfile: async (userId, profileData) => {
        return jsonDb.users.update(userId, profileData);
    }
};

module.exports = userService;

