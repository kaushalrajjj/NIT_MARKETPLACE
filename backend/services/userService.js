const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');

const userService = {
    getPublicStats: async () => {
        const users = await userRepository.find();
        const products = await productRepository.find({ isApproved: true });
        return {
            totalStudents: users.length,
            totalListings: products.length,
            happyTraders: Math.floor(users.length * 0.95)
        };
    },

    getUserById: async (id) => {
        return await userRepository.findById(id);
    },

    updateUserProfile: async (userId, profileData) => {
        return await userRepository.update(userId, profileData);
    }
};

module.exports = userService;

