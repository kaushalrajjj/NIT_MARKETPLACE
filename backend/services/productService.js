const jsonDb = require('../config/jsonDb');
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
        let products = productRepository.query(filters);

        // 2. Apply Sorting
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
        const processedProducts = paginatedProducts.map(p => {
            let sellerInfo = null;
            if (fields.length === 0 || fields.includes('seller')) {
                const seller = jsonDb.users.findById(p.seller);
                const activity = activityRepository.getOrCreate(p.seller);
                sellerInfo = seller ? {
                    _id: seller._id,
                    name: seller.name,
                    roll: seller.roll || '',
                    email: seller.email,
                    phone: seller.phone,
                    whatsapp: seller.whatsapp,
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
                Object.assign(result, p);
                result.seller = sellerInfo;
            }

            return result;
        });

        return {
            products: processedProducts,
            total: totalItems,
            page: Number(page),
            pages: Math.ceil(totalItems / Number(limit))
        };
    },

    createProduct: async (userId, productData) => {
        const data = {
            ...productData,
            seller: userId,
            isApproved: true, // Auto-approve for now
            status: 'available'
        };
        const product = productRepository.create(data);

        // Track in user activity
        activityRepository.addListed(userId, product._id);

        return product;
    },

    getProductById: async (id) => {
        const product = productRepository.findById(id);
        if (!product) return null;

        const seller = jsonDb.users.findById(product.seller);
        const activity = activityRepository.getOrCreate(product.seller);
        return {
            ...product,
            seller: seller ? {
                _id: seller._id,
                name: seller.name,
                roll: seller.roll || '',
                email: seller.email,
                phone: seller.phone,
                whatsapp: seller.whatsapp,
                profileImage: activity.img || null
            } : null
        };
    },

    getUserProducts: async (userId) => {
        return productRepository.find({ seller: userId });
    },

    updateProductStatus: async (productId, userId, status) => {
        const product = productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.seller !== userId) throw new Error('Not authorized');

        const updated = productRepository.update(productId, { status });

        // If marking as sold, record in activity
        if (status === 'sold') {
            activityRepository.markSold(userId, productId);
        }

        return updated;
    },

    deleteProduct: async (productId, userId) => {
        const product = productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.seller !== userId) throw new Error('Not authorized');

        productRepository.delete(productId);

        // Remove from ALL users' wishlists and seller's listed array across the whole app
        activityRepository.removeProductEverywhereOnDelete(productId);
    },

    /**
     * Sync wishlist toggle for a user.
     * @param {string} userId
     * @param {string} productId
     * @param {boolean} isAdded
     */
    updateWishlist: async (userId, productId, isAdded) => {
        const activity = activityRepository.getOrCreate(userId);
        const currentList = activity.wishlisted || [];

        let updatedList;
        if (isAdded) {
            updatedList = currentList.includes(productId)
                ? currentList
                : [...currentList, productId];
        } else {
            updatedList = currentList.filter(id => id !== productId);
        }

        return activityRepository.update(userId, { wishlisted: updatedList });
    },

    /**
     * Get a user's full activity record.
     */
    getUserActivity: async (userId) => {
        return activityRepository.getOrCreate(userId);
    },

    /**
     * Update editable fields of a product (owner only).
     * Category is NOT allowed to change once a listing is posted.
     * @param {string} productId
     * @param {string} requesterId
     * @param {Object} updates - { title, description, price, condition }
     */
    updateProduct: async (productId, requesterId, updates) => {
        const product = productRepository.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.seller !== requesterId) throw new Error('Unauthorized: not your listing');

        // Whitelist — category is locked, never patched here
        const { title, description, price, condition } = updates;
        const patch = {};
        if (title       !== undefined) patch.title       = String(title).trim();
        if (description !== undefined) patch.description = String(description).trim();
        if (price       !== undefined) patch.price       = Number(price);
        if (condition   !== undefined) patch.condition   = String(condition);

        if (Object.keys(patch).length === 0) throw new Error('No valid fields to update');

        return productRepository.update(productId, patch);
    }
};

module.exports = productService;
