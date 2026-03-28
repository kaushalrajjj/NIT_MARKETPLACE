const mongoose = require('mongoose');

/**
 * UserActivity Model — MongoDB Schema for per-user activity tracking
 * ──────────────────────────────────────────────────────────────────
 * Stored in the 'useractivities' collection.
 *
 * DESIGN DECISION — Why a separate collection?
 *   Activity data (wishlisted items, listed products, avatar URL) is dynamic
 *   and changes frequently. Keeping it separate from the User model means:
 *   - User documents stay small and fast to query for auth
 *   - Activity can grow without affecting user doc size
 *   - Avatar URL changes don't require mutating identity data
 *
 * IMPORTANT — The _id is NOT auto-generated:
 *   The _id of each UserActivity document is the SAME ObjectId as the
 *   corresponding User document. This creates a 1:1 link.
 *   Example: User._id = "abc123" → UserActivity._id = "abc123"
 *
 *   This allows fast lookups: UserActivity.findById(userId) — no separate index needed.
 *   activityRepository.getOrCreate() relies on this pattern.
 *
 * GOTCHA:
 *   If you try to create a UserActivity document with an _id that already exists,
 *   MongoDB throws a duplicate key error (E11000). This happened with the seed data.
 *   Always use getOrCreate() instead of create() directly.
 */
const userActivitySchema = new mongoose.Schema({
    // _id = same ObjectId as the User document — 1:1 mapping, no auto-generation
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Products the user has saved/bookmarked — array of Product ObjectIds
    // Populated when user clicks the heart icon on a product card
    wishlisted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Products this user has created listings for — array of Product ObjectIds
    // Added when user submits a new listing via /sell
    listed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Products this user has marked as sold — array of Product ObjectIds
    // Added when user clicks "Mark as Sold" on their dashboard
    sold: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Cloudinary URL for the user's profile avatar image
    // null if the user hasn't uploaded a profile photo
    // NOTE: This is the canonical source of truth for avatars — NOT the User model
    img: { type: String, default: null }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
module.exports = UserActivity;
