const { cloudinary, productStorage } = require('../config/cloudinary');
const multer = require('multer');
const productRepository = require('../repositories/productRepository');

const upload = multer({
    storage: productStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // increased to 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const path = require('path');
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only image files are allowed (jpg, png, webp)'));
    }
});

const productImageController = {
    /**
     * POST /api/products/:id/image — Upload or replace product image.
     */
    uploadImage: [
        upload.single('image'),
        async (req, res) => {
            try {
                if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });


                const productId = req.params.id;
                const product   = await productRepository.findById(productId);
                if (!product) return res.status(404).json({ message: 'Product not found' });
                
                if (product.seller.toString() !== req.user._id.toString())
                    return res.status(403).json({ message: 'Unauthorized: not your listing' });

                // Delete old image from Cloudinary if it exists
                if (product.img && product.img.startsWith('http')) {
                    // Extract public_id from URL if we were storing URLs
                    // However, it's safer to store the public_id in the DB.
                    // For now, let's assume we store the URL.
                    try {
                        const urlParts = product.img.split('/');
                        const fileName = urlParts[urlParts.length - 1].split('.')[0];
                        const folderName = 'nit_marketplace';
                        await cloudinary.uploader.destroy(`${folderName}/${fileName}`);
                    } catch (err) {
                        console.error('Cloudinary delete error:', err);
                    }
                }

                // Cloudinary stores the URL in req.file.path
                const newImageUrl = req.file.path;
                await productRepository.update(productId, { img: newImageUrl });

                res.json({
                    message: 'Image uploaded to Cloudinary.',
                    img: newImageUrl,
                    url: newImageUrl
                });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        }
    ],

    /**
     * DELETE /api/products/:id/image — Remove product image.
     */
    removeImage: async (req, res) => {
        try {
            const productId = req.params.id;
            const product   = await productRepository.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            
            if (product.seller.toString() !== req.user._id.toString())
                return res.status(403).json({ message: 'Unauthorized: not your listing' });

            if (product.img) {
                if (product.img.startsWith('http')) {
                    try {
                        const urlParts = product.img.split('/');
                        const fileName = urlParts[urlParts.length - 1].split('.')[0];
                        const folderName = 'nit_marketplace/products';
                        await cloudinary.uploader.destroy(`${folderName}/${fileName}`);
                    } catch (err) {
                        console.error('Cloudinary delete error:', err);
                    }
                }
                await productRepository.update(productId, { img: null });
            }

            res.json({ message: 'Image removed.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = productImageController;
