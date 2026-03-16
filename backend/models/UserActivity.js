const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wishlisted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    listed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    sold: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    img: { type: String, default: null }
}, { timestamps: true });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
module.exports = UserActivity;
