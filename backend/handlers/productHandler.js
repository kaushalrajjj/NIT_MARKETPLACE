const jsonDb = require('../config/jsonDb');

// @desc    Get all products (approved ones)
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const { cat, minPrice, maxPrice, condition, location, search, page = 1, limit = 12 } = req.query;

        // Start with approved and available products
        let products = jsonDb.products.find({ isApproved: true, status: 'available' });

        // Apply filters manually since jsonDb.find is simple
        if (cat && cat !== 'all') {
            products = products.filter(p => p.category.toLowerCase() === cat.toLowerCase());
        }

        if (minPrice && minPrice !== '') {
            products = products.filter(p => p.price >= Number(minPrice));
        }

        if (maxPrice && maxPrice !== '') {
            products = products.filter(p => p.price <= Number(maxPrice));
        }

        if (condition) {
            const conditions = condition.split(',');
            products = products.filter(p => conditions.includes(p.condition));
        }

        if (location && location !== 'All Locations') {
            products = products.filter(p => p.location === location);
        }

        const { minRating } = req.query;
        if (minRating && Number(minRating) > 0) {
            products = products.filter(p => {
                const seller = jsonDb.users.findById(p.seller);
                const rating = seller ? (seller.rating || 0) : 0;
                return rating >= Number(minRating);
            });
        }

        if (search) {
            const s = search.toLowerCase();
            products = products.filter(p =>
                p.title.toLowerCase().includes(s) ||
                p.description.toLowerCase().includes(s)
            );
        }

        // Apply sorting
        const { sortBy } = req.query;
        if (sortBy === 'price_low') {
            products.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_high') {
            products.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'popular') {
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const totalItems = products.length;

        // Apply Pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const paginatedProducts = products.slice(startIndex, startIndex + Number(limit));

        const productsWithSeller = paginatedProducts.map(p => {
            const seller = jsonDb.users.findById(p.seller);
            return {
                ...p,
                seller: seller ? {
                    _id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    phone: seller.phone,
                    whatsapp: seller.whatsapp,
                    rating: seller.rating || 0,
                    reviewCount: seller.reviewCount || 0
                } : null
            };
        });

        res.json({
            products: productsWithSeller,
            total: totalItems,
            page: Number(page),
            pages: Math.ceil(totalItems / Number(limit))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new product listing
// @route   POST /api/products
const createProduct = async (req, res) => {
    const { title, description, price, category, condition, location, images } = req.body;

    try {
        const product = jsonDb.products.create({
            seller: req.user._id,
            title,
            description,
            price: Number(price),
            category,
            condition,
            location: location || 'NIT KKR',
            images,
            isApproved: true,
            status: 'available'
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = jsonDb.products.findById(req.params.id);

        if (product) {
            const seller = jsonDb.users.findById(product.seller);
            res.json({
                ...product,
                seller: seller ? {
                    _id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    phone: seller.phone,
                    whatsapp: seller.whatsapp,
                    rating: seller.rating || 0,
                    reviewCount: seller.reviewCount || 0
                } : null
            });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my own products
// @route   GET /api/products/me
const getMyProducts = async (req, res) => {
    try {
        const products = jsonDb.products.find({ seller: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public stats for homepage
// @route   GET /api/products/stats/public
const getPublicStats = async (req, res) => {
    try {
        const users = jsonDb.users.find();
        const products = jsonDb.products.find({ isApproved: true });
        res.json({
            totalStudents: users.length,
            totalListings: products.length,
            happyTraders: Math.floor(users.length * 0.95)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product status (e.g., mark as sold)
// @route   PUT /api/products/:id/status
const updateProductStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const product = jsonDb.products.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.seller !== req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updated = jsonDb.products.update(req.params.id, { status });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = jsonDb.products.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.seller !== req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        jsonDb.products.delete(req.params.id);
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, createProduct, getProductById, getMyProducts, getPublicStats, updateProductStatus, deleteProduct };
