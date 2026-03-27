const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    // Link to the primary User document
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Array of product IDs this user has liked
    wishlisted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    // Array of product IDs this user has posted for sale
    listed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    // Array of product IDs this user has successfully sold
    sold: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    // URL for user's profile avatar on Cloudinary
    img: { type: String, default: null }
}, { timestamps: true });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
module.exports = UserActivity;
