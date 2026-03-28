const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const activityRepository = require('../repositories/activityRepository');

/**
 * adminService — Business logic for admin panel operations
 * ──────────────────────────────────────────────────────────
 * Handles product moderation, stats, and user management.
 * All functions are only callable via routes protected by the admin middleware.
 */
const adminService = {
    /**
     * getPendingProducts — Get all listings awaiting admin approval.
     *
     * Fetches products where isApproved is false.
     * Attaches minimal seller info (name, email) for display in the admin panel.
     * Note: This returns ALL unapproved products — including ones the admin is
     * reviewing for the first time as well as ones that were re-submitted.
     */
    getPendingProducts: async () => {
        const products = await productRepository.find({ isApproved: false });
        return await Promise.all(products.map(async p => {
            const seller = await userRepository.findById(p.seller);
            return {
                // Convert Mongoose document to plain object before spreading
                ...(p.toObject ? p.toObject() : p),
                // Replace the seller ID with just the info admin needs to see
                seller: seller ? { name: seller.name, email: seller.email } : null
            };
        }));
    },

    /**
     * approveProduct — Approve or reject a product listing.
     *
     * WHY reject with status change instead of deletion?
     *   Deleting rejected products would make them disappear from the seller's dashboard.
     *   Keeping them with status 'rejected_by_admin' lets sellers see which listings
     *   were rejected and potentially understand why.
     *
     * The actionByAdmin field records which admin took the action (audit trail).
     *
     * @param {string}  productId - MongoDB ObjectId of the product
     * @param {boolean} approve   - true = approve, false = reject
     * @param {ObjectId} adminId  - The admin performing the action (from req.user._id)
     */
    approveProduct: async (productId, approve, adminId) => {
        if (approve) {
            // Approve: make it live on the marketplace
            return await productRepository.update(productId, {
                isApproved: true,
                status: 'available',
                actionByAdmin: adminId
            });
        } else {
            // Reject: keep in DB but mark as rejected so seller can see it
            return await productRepository.update(productId, {
                isApproved: false,
                status: 'rejected_by_admin',
                actionByAdmin: adminId
            });
        }
    },

    /**
     * getUsers — Return all registered students with passwords stripped.
     *
     * Strips the password hash before returning — never expose bcrypt hashes.
     * Only returns students (users collection), not admins.
     */
    getUsers: async () => {
        const users = await userRepository.find();
        return users.map(u => {
            const userObj = u.toObject ? u.toObject() : u;
            const { password, ...rest } = userObj; // Destructure to remove password
            return rest;
        });
    },

    /**
     * getStats — Calculate platform-wide metrics for the admin dashboard.
     *
     * Returns:
     *   totalUsers      — number of registered students
     *   liveListings    — approved + available products on the marketplace
     *   pendingListings — products waiting for admin review
     *   totalVolume     — sum of all product prices (₹ value of everything listed)
     */
    getStats: async () => {
        const users = await userRepository.find();
        const products = await productRepository.find({});

        // Count live listing (visible on browse page)
        const liveListings = products.filter(p =>
            p.status === 'available' && p.isApproved
        ).length;

        // Count pending (submitted but not yet moderated — not rejected, not deleted)
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
     * getAllProducts — Return every product in the system with seller info attached.
     *
     * Unlike the public browse endpoint (which only shows approved+available),
     * this returns products in all states: pending, approved, rejected, deleted.
     * Sorted newest first so recent submissions appear at the top.
     */
    getAllProducts: async () => {
        const products = await productRepository.find({});
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return await Promise.all(products.map(async p => {
            const seller = await userRepository.findById(p.seller);
            return {
                ...(p.toObject ? p.toObject() : p),
                seller: seller
                    ? { name: seller.name, email: seller.email, rollNo: seller.rollNo }
                    : null
            };
        }));
    },

    /**
     * deleteProductAdmin — Admin force-deletes an inappropriate listing.
     *
     * Unlike student self-deletion (which removes the doc from MongoDB entirely),
     * admin deletion sets status: 'deleted_by_admin' so there's a paper trail
     * of what was moderated and by whom.
     *
     * Also removes the product from EVERY user's wishlist across the platform —
     * no point in keeping a dead listing in anyone's saved items.
     *
     * @param {string}   productId - MongoDB ObjectId of the product
     * @param {ObjectId} adminId   - Admin who performed the deletion
     */
    deleteProductAdmin: async (productId, adminId) => {
        const result = await productRepository.update(productId, {
            status: 'deleted_by_admin',
            actionByAdmin: adminId
        });
        // Remove from all users' wishlists — admins can't "un-delete" via wishlist
        await activityRepository.removeFromAllWishlists(productId);
        return result;
    }
};

module.exports = adminService;
