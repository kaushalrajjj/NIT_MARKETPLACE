const jsonDb = require('../config/jsonDb');
const productRepository = require('../repositories/productRepository');

const adminService = {
    getPendingProducts: async () => {
        const products = productRepository.find({ isApproved: false });
        return products.map(p => {
            const seller = jsonDb.users.findById(p.seller);
            return { ...p, seller: seller ? { name: seller.name, email: seller.email } : null };
        });
    },

    approveProduct: async (productId, approve) => {
        if (approve) {
            return productRepository.update(productId, { isApproved: true });
        } else {
            return productRepository.delete(productId);
        }
    },

    getUsers: async () => {
        const users = jsonDb.users.find();
        return users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
    },

    getStats: async () => {
        const users = jsonDb.users.find();
        const products = productRepository.find({});
        const liveListings = products.filter(p => p.status === 'available').length;
        const pendingListings = products.filter(p => p.status === 'deleted_by_admin').length;

        return {
            totalUsers: users.length,
            liveListings,
            totalVolume: products.reduce((acc, p) => acc + (p.price || 0), 0)
        };
    },

    getAllProducts: async () => {
        const products = productRepository.find({});
        // Return newest first
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return products.map(p => {
            const seller = jsonDb.users.findById(p.seller);
            return { ...p, seller: seller ? { name: seller.name, email: seller.email, roll: seller.roll } : null };
        });
    },

    deleteProductAdmin: async (productId) => {
        return productRepository.update(productId, { status: 'deleted_by_admin' });
    }
};

module.exports = adminService;

