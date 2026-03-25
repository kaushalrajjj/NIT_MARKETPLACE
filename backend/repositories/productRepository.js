const Product = require('../models/Product');

/** Product Repository — Raw Mongoose queries */
const productRepository = {
    /**
     * Finds products based on raw filters.
     * @param {Object} query - Mongoose query object
     */
    find: async (query) => {
        return await Product.find(query);
    },

    /** Find many products with filtering logic. */
    query: async (filters = {}) => {
        const { category, minPrice, maxPrice, condition, search, excludeSeller, seller, sellerYear } = filters;
        
        let query = { isApproved: true, status: 'available' };

        if (excludeSeller) {
            query.seller = { $ne: excludeSeller };
        }
        if (seller) {
            query.seller = seller;
        }

        // Logic for filtering by seller year
        if (sellerYear) {
            const User = require('../models/User'); // Import on-demand to avoid circular dependency
            const sellersInYear = await User.find({ year: sellerYear }).select('_id');
            const sellerIds = sellersInYear.map(u => u._id);
            
            if (query.seller) {
                // If already filtering by a specific seller, check if they are in the specified year
                if (!sellerIds.some(id => id.toString() === query.seller.toString())) {
                    return []; // No match
                }
            } else {
                query.seller = { $in: sellerIds };
            }
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (condition) {
            const conditions = typeof condition === 'string' ? condition.split(',') : condition;
            query.condition = { $in: conditions };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        return await Product.find(query).sort({ createdAt: -1 });
    },

    // Fetch a single product by ID
    findById: async (id) => {
        return await Product.findById(id);
    },

    // Create a new product entry
    create: async (data) => {
        return await Product.create(data);
    },

    // Update an existing product's fields (status, info, etc.)
    update: async (id, updateData) => {
        return await Product.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    },

    // Remove a product from the database
    delete: async (id) => {
        return await Product.findByIdAndDelete(id);
    }
};

module.exports = productRepository;
