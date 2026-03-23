const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');

const userService = {
    /** 
     * Get aggregate platform stats for the landing page. 
     */
    getPublicStats: async () => {
        const users = await userRepository.find();
        const products = await productRepository.find({ isApproved: true });
        return {
            totalStudents: users.length,
            totalListings: products.length,
            happyTraders: Math.floor(users.length * 0.95)
        };
    },

    /** 
     * Retrieve a user's database document by its ID. 
     */
    getUserById: async (id) => {
        return await userRepository.findById(id);
    },

    /** 
     * Update user details (Mobile, WhatsApp, or Password). 
     */
    updateUserProfile: async (userId, profileData) => {
        return await userRepository.update(userId, profileData);
    }
};

module.exports = userService;

