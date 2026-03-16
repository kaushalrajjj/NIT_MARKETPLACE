const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const activityRepository = require('../repositories/activityRepository');

const adminService = {
    getPendingProducts: async () => {
        const products = await productRepository.find({ isApproved: false });
        return await Promise.all(products.map(async p => {
            const seller = await userRepository.findById(p.seller);
            return { 
                ...(p.toObject ? p.toObject() : p), 
                seller: seller ? { name: seller.name, email: seller.email } : null 
            };
        }));
    },

    approveProduct: async (productId, approve) => {
        if (approve) {
            return await productRepository.update(productId, { isApproved: true });
        } else {
            const res = await productRepository.delete(productId);
            // Cleanup everywhere
            await activityRepository.removeProductEverywhereOnDelete(productId);
            return res;
        }
    },

    getUsers: async () => {
        const users = await userRepository.find();
        return users.map(u => {
            const userObj = u.toObject ? u.toObject() : u;
            const { password, ...rest } = userObj;
            return rest;
        });
    },

    getStats: async () => {
        const users = await userRepository.find();
        const products = await productRepository.find({});
        const liveListings = products.filter(p => p.status === 'available' && p.isApproved).length;
        const pendingListings = products.filter(p => p.isApproved === false).length;

        return {
            totalUsers: users.length,
            liveListings,
            pendingListings,
            totalVolume: products.reduce((acc, p) => acc + (p.price || 0), 0)
        };
    },

    getAllProducts: async () => {
        const products = await productRepository.find({});
        // Return newest first
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return await Promise.all(products.map(async p => {
            const seller = await userRepository.findById(p.seller);
            return { 
                ...(p.toObject ? p.toObject() : p), 
                seller: seller ? { name: seller.name, email: seller.email, rollNo: seller.rollNo } : null 
            };
        }));
    },

    deleteProductAdmin: async (productId) => {
        return await productRepository.update(productId, { status: 'deleted_by_admin' });
    }
};

module.exports = adminService;

