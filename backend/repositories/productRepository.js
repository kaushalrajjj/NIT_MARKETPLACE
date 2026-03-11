const jsonDb = require('../config/jsonDb');

/** Product Repository — raw DB queries only. Sorting/pagination handled by service layer. */
const productRepository = {
    /**
     * Finds products based on raw filters.
     * @param {Object} query - Simple key-value pairs for jsonDb.find
     */
    find: (query) => {
        return jsonDb.products.find(query);
    },

    /** Find many products with manual filtering logic. */
    query: (filters = {}) => {
        const { category, minPrice, maxPrice, condition, search, excludeSeller } = filters;
        
        // Start with approved and available products
        let products = jsonDb.products.find({ isApproved: true, status: 'available' });

        if (excludeSeller) {
            products = products.filter(p => p.seller !== excludeSeller);
        }

        if (category && category !== 'all') {
            products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        if (minPrice && minPrice !== '') {
            products = products.filter(p => p.price >= Number(minPrice));
        }

        if (maxPrice && maxPrice !== '') {
            products = products.filter(p => p.price <= Number(maxPrice));
        }

        if (condition) {
            const conditions = typeof condition === 'string' ? condition.split(',') : condition;
            products = products.filter(p => conditions.includes(p.condition));
        }

        if (search) {
            const s = search.toLowerCase();
            products = products.filter(p =>
                p.title.toLowerCase().includes(s) ||
                p.description.toLowerCase().includes(s)
            );
        }

        return products;
    },

    findById: (id) => {
        return jsonDb.products.findById(id);
    },

    create: (data) => {
        return jsonDb.products.create(data);
    },

    update: (id, updateData) => {
        return jsonDb.products.update(id, updateData);
    },

    delete: (id) => {
        return jsonDb.products.delete(id);
    }
};

module.exports = productRepository;
