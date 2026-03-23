const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nit_marketplace/products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // Removed fixed transformation to store original quality and format
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nit_marketplace/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  },
});

module.exports = { cloudinary, productStorage, avatarStorage };
