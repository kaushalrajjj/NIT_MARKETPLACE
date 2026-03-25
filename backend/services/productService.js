const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const activityRepository = require('../repositories/activityRepository');

/**
 * Product Service — Business Logic Layer
 * =======================================
 * Responsibilities: sorting, pagination, seller info resolution,
 * authorization checks, and wishlist management.
 */
const productService = {
    /**
     * Handles complex querying, sorting, pruning, and pagination.
     */
    queryProducts: async (params) => {
        const { filters = {}, sort = 'newest', fields = [], page = 1, limit = 12 } = params;

        // 1. Fetch raw data from repository
        let products = await productRepository.query(filters);

        // 2. Apply Sorting (Sorting is now handled in query, but we can refine here if needed)
        // For convenience, we'll keep the JS sorting if complex logic is needed, 
        // but Mongoose is faster. We'll stick to JS for now to preserve your logic exactly.
        if (sort === 'price_low') {
            products.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_high') {
            products.sort((a, b) => b.price - a.price);
        } else {
            // Default to newest
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const totalItems = products.length;

        // 3. Apply Pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const paginatedProducts = products.slice(startIndex, startIndex + Number(limit));

        // 4. Resolve Seller and Prune Fields
        const processedProducts = await Promise.all(paginatedProducts.map(async p => {
            let sellerInfo = null;
            if (fields.length === 0 || fields.includes('seller')) {
                const seller = await userRepository.findById(p.seller);
                const activity = await activityRepository.getOrCreate(p.seller);
                sellerInfo = seller ? {
                    _id: seller._id,
                    name: seller.name,
                    rollNo: seller.rollNo || '',
                    email: seller.email,
                    mobileNo: seller.mobileNo,
                    whatsappNo: seller.whatsappNo,
                    branch: seller.branch,
                    year: seller.year,
                    hostel: seller.hostel,
                    profileImage: activity.img || null
                } : null;
            }

            // Always include _id
            const result = { _id: p._id };

            if (fields.length > 0) {
                fields.forEach(f => {
                    if (f === 'seller') {
                        result.seller = sellerInfo;
                    } else if (p[f] !== undefined) {
                        result[f] = p[f];
                    }
                });
            } else {
                // Mongoose documents need to be converted to plain objects
                const pObj = p.toObject ? p.toObject() : p;
                Object.assign(result, pObj);
                result.seller = sellerInfo;
            }

            return result;
        }));

        return {
            products: processedProducts,
            total: totalItems,
            page: Number(page),
            pages: Math.ceil(totalItems / Number(limit))
        };
    },

    /** 
     * List a new product for sale: 
     * Attaches seller ID, initializes status, and tracks in activity. 
     */
    createProduct: async (userId, productData) => {
        const data = {
            ...productData,
            seller: userId,
            isApproved: false, // Moderated by admin
            status: 'available'
        };
        const product = await productRepository.create(data);

        // Track in user activity
        await activityRepository.addListed(userId, product._id);

        return product;
    },

    /** 
     * Get single product with full seller profile resolved. 
     */
    getProductById: async (id) => {
        const product = await productRepository.findById(id);
        if (!product) return null;

        const seller = await userRepository.findById(product.seller);
        const activity = await activityRepository.getOrCreate(product.seller);
        return {
            ...(product.toObject ? product.toObject() : product),
            seller: seller ? {
                _id: seller._id,
                name: seller.name,
                rollNo: seller.rollNo || '',
                email: seller.email,
                mobileNo: seller.mobileNo,
                whatsappNo: seller.whatsappNo,
                profileImage: activity.img || null,
                branch: seller.branch,
                year: seller.year,
                hostel: seller.hostel
            } : null
        };
    },

    /** 
     * Retrieve all products listed by a specific seller. 
     */
    getUserProducts: async (userId) => {
        return productRepository.find({ seller: userId });
    },

    /** 
     * Update product availability: 
     * Marks as 'sold' or resets to 'available'. Records 'sold' event in activity. 
     */
    updateProductStatus: async (productId, userId, status) => {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.seller.toString() !== userId.toString()) throw new Error('Not authorized');

        const updated = await productRepository.update(productId, { status });

        // If marking as sold, record in seller's activity AND remove from all users' wishlists
        if (status === 'sold') {
            await activityRepository.markSold(userId, productId);
            await activityRepository.removeFromAllWishlists(productId);
        }

        return updated;
    },

    /** 
     * Permanently delete a listing: 
     * Ownership check, then triggers global activity cleanup. 
     */
    deleteProduct: async (productId, userId) => {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.seller.toString() !== userId.toString()) throw new Error('Not authorized');

        await productRepository.delete(productId);

        // Remove from ALL users' wishlists and seller's listed array across the whole app
        await activityRepository.removeProductEverywhereOnDelete(productId);
    },

    /**
     * Sync wishlist toggle for a user.
     * @param {string} userId
     * @param {string} productId
     * @param {boolean} isAdded
     */
    updateWishlist: async (userId, productId, isAdded) => {
        const activity = await activityRepository.getOrCreate(userId);
        const currentList = activity.wishlisted || [];

        let updatedList;
        if (isAdded) {
            updatedList = currentList.includes(productId)
                ? currentList
                : [...currentList, productId];
        } else {
            updatedList = currentList.filter(id => id.toString() !== productId.toString());
        }

        return await activityRepository.update(userId, { wishlisted: updatedList });
    },

    /**
     * Get a user's full activity record.
     */
    getUserActivity: async (userId) => {
        return await activityRepository.getOrCreate(userId);
    },

    /**
     * Update editable fields of a product (owner only).
     * Category is NOT allowed to change once a listing is posted.
     * @param {string} productId
     * @param {string} requesterId
     * @param {Object} updates - { title, description, price, condition }
     */
    updateProduct: async (productId, requesterId, updates) => {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.seller.toString() !== requesterId.toString()) throw new Error('Unauthorized: not your listing');

        // Whitelist — category is locked, never patched here
        const { title, description, price, condition } = updates;
        const patch = {};
        if (title       !== undefined) patch.title       = String(title).trim();
        if (description !== undefined) patch.description = String(description).trim();
        if (price       !== undefined) patch.price       = Number(price);
        if (condition   !== undefined) patch.condition   = String(condition);

        if (Object.keys(patch).length === 0) throw new Error('No valid fields to update');

        return await productRepository.update(productId, patch);
    }
};

module.exports = productService;
