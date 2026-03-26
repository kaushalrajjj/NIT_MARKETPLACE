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

        // 2. Logic for filtering by seller year
        if (sellerYear) {
            const User = require('../models/User'); // Import on-demand to avoid circular dependency
            const mongoose = require('mongoose');
            const yearNum = Number(sellerYear);
            
            const sellersInYear = await User.find({ year: yearNum }).select('_id');
            const sellerIds = sellersInYear.map(u => u._id);

            // Consolidate seller filters: exclude, specific, and year
            if (seller) {
                // Specific seller filtering
                if (!sellerIds.some(id => id.toString() === seller.toString())) {
                    return { products: [] };
                }
                query.seller = seller;
            } else {
                // Combined exclude + year filtering
                const yearMatch = { $in: sellerIds.map(id => new mongoose.Types.ObjectId(id.toString())) };
                if (excludeSeller) {
                    query.seller = { $ne: new mongoose.Types.ObjectId(excludeSeller.toString()), ...yearMatch };
                } else {
                    query.seller = yearMatch;
                }
            }
        } else {
            // No year filter: apply legacy seller logic
            if (excludeSeller) {
                const mongoose = require('mongoose');
                query.seller = { $ne: new mongoose.Types.ObjectId(excludeSeller.toString()) };
            }
            if (seller) {
                query.seller = seller;
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

        const finalProducts = await Product.find(query).sort({ createdAt: -1 });
        
        return {
            products: finalProducts
        };
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
