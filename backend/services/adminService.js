const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const activityRepository = require('../repositories/activityRepository');

const adminService = {
    /** 
     * Get products awaiting approval with seller details attached. 
     */
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

    /** 
     * Approve a listing or permanently delete a rejected one. 
     */
    approveProduct: async (productId, approve, adminId) => {
        if (approve) {
            return await productRepository.update(productId, { isApproved: true, status: 'available', actionByAdmin: adminId });
        } else {
            // Instead of deleting, we mark it as rejected so the user can see it on their dashboard
            return await productRepository.update(productId, { isApproved: false, status: 'rejected_by_admin', actionByAdmin: adminId });
        }
    },

    /** 
     * Retrieve all users, stripping away passwords. 
     */
    getUsers: async () => {
        const users = await userRepository.find();
        return users.map(u => {
            const userObj = u.toObject ? u.toObject() : u;
            const { password, ...rest } = userObj;
            return rest;
        });
    },

    /** 
     * Calculate global metrics for the admin dashboard. 
     */
    getStats: async () => {
        const users = await userRepository.find();
        const products = await productRepository.find({});
        const liveListings = products.filter(p => p.status === 'available' && p.isApproved).length;
        const pendingListings = products.filter(p => 
            p.isApproved === false && 
            p.status !== 'rejected_by_admin' && 
            p.status !== 'deleted_by_admin'
        ).length;

        return {
            totalUsers: users.length,
            liveListings,
            pendingListings,
            totalVolume: products.reduce((acc, p) => acc + (p.price || 0), 0)
        };
    },

    /** 
     * Retrieve every product listing in the system with full seller context. 
     */
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

    /** 
     * Forcefully change product status to 'deleted_by_admin'. 
     */
    deleteProductAdmin: async (productId, adminId) => {
        const result = await productRepository.update(productId, { status: 'deleted_by_admin', actionByAdmin: adminId });
        // Remove from every user's wishlist — product is no longer obtainable
        await activityRepository.removeFromAllWishlists(productId);
        return result;
    }
};

module.exports = adminService;

