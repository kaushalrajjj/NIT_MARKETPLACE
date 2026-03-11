const path = require('path');
const fs   = require('fs');
const multer = require('multer');
const jsonDb = require('../config/jsonDb');

// ── Storage: /data/product-images ─────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../../data/product-images');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        // Filename: productId_timestamp.ext
        cb(null, `${req.params.id}_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only image files are allowed (jpg, png, webp)'));
    }
});

const productImageController = {
    /**
     * POST /api/products/:id/image — Upload or replace product image.
     * Only the listing owner can upload.
     */
    uploadImage: [
        upload.single('image'),
        async (req, res) => {
            try {
                if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

                const productId = req.params.id;
                const product   = jsonDb.products.findById(productId);
                if (!product) return res.status(404).json({ message: 'Product not found' });
                if (product.seller !== req.user._id)
                    return res.status(403).json({ message: 'Unauthorized: not your listing' });

                // Delete old image if one exists
                if (product.img) {
                    const oldPath = path.join(UPLOAD_DIR, product.img);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }

                const newFilename = req.file.filename;
                jsonDb.products.update(productId, { img: newFilename });

                res.json({
                    message: 'Image uploaded.',
                    img: newFilename,
                    url: `/product-images/${newFilename}`
                });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        }
    ],

    /**
     * DELETE /api/products/:id/image — Remove product image (revert to emoji).
     */
    removeImage: async (req, res) => {
        try {
            const productId = req.params.id;
            const product   = jsonDb.products.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            if (product.seller !== req.user._id)
                return res.status(403).json({ message: 'Unauthorized: not your listing' });

            if (product.img) {
                const imgPath = path.join(UPLOAD_DIR, product.img);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                jsonDb.products.update(productId, { img: null });
            }

            res.json({ message: 'Image removed.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = productImageController;
