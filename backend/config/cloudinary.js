const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

/**
 * Cloudinary Configuration & Multer Storage Adapters
 * ─────────────────────────────────────────────────────
 * Cloudinary is the image hosting service for this app.
 * All product and avatar images are stored on Cloudinary — NOT on the server disk.
 *
 * WHY Cloudinary?
 *   - Serverless environments (like Vercel) don't have persistent disk storage
 *   - Cloudinary provides CDN delivery (fast global loading of images)
 *   - Free tier includes enough storage for this project's scale
 *   - Built-in image transformations (resize, crop, format conversion)
 *
 * HOW IT WORKS WITH MULTER:
 *   multer is a middleware for handling multipart/form-data (file uploads).
 *   Normally, multer saves files to disk (diskStorage).
 *   multer-storage-cloudinary replaces that with Cloudinary as the storage target.
 *   When a user uploads a file:
 *     1. The request hits the multer middleware
 *     2. multer intercepts the file stream
 *     3. CloudinaryStorage streams it directly to Cloudinary (no disk write)
 *     4. Cloudinary returns a URL
 *     5. multer puts that URL in req.file.path
 *
 * TWO STORAGE ADAPTERS:
 *   productStorage → for product listing images (nit_marketplace/products/)
 *   avatarStorage  → for profile photos (nit_marketplace/avatars/)
 *   They're separate to apply different transformations and use different folders.
 */

// Load environment variables (needed here because this file is imported early)
dotenv.config();

// Configure the Cloudinary SDK with credentials from environment variables
cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME, // Your cloud namespace (e.g. 'dlj8ewjtu')
  api_key:     process.env.CLOUDINARY_API_KEY,    // Public key for API requests
  api_secret:  process.env.CLOUDINARY_API_SECRET  // Secret key — NEVER expose to browser
});

/**
 * productStorage — Multer adapter for product listing images.
 *
 * Stores images in: Cloudinary → nit_marketplace/products/
 * No automatic transformations applied — original quality is preserved.
 * Transformations are applied on-the-fly at display time via getOptimizedImageUrl().
 */
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nit_marketplace/products', // Cloudinary folder path
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // No transformation: store original. Resizing is done at display time (see helpers.js).
  },
});

/**
 * avatarStorage — Multer adapter for user profile photo uploads.
 *
 * Stores images in: Cloudinary → nit_marketplace/avatars/
 * Applies auto-crop transformation at upload time:
 *   - Resizes to exactly 400×400px (square)
 *   - crop: 'fill' = fills the square, may crop edges
 *   - gravity: 'face' = Cloudinary's face detection keeps the face centered
 *     (if no face is detected, crops to center)
 *
 * WHY transform at upload for avatars?
 *   Profile photos are always displayed as squares.
 *   Pre-processing at upload saves bandwidth every time the avatar is loaded.
 */
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nit_marketplace/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  },
});

// Export the Cloudinary SDK (for direct API calls like destroy) and both storage adapters
module.exports = { cloudinary, productStorage, avatarStorage };
