const UserActivity = require('../models/UserActivity');

/**
 * activityRepository — Database queries for the UserActivities collection
 * ──────────────────────────────────────────────────────────────────────────
 * Each student has ONE activity document with the same _id as their User document.
 * This repository handles all CRUD for user activity: wishlists, listings, avatar.
 *
 * KEY DESIGN: getOrCreate pattern
 *   We use getOrCreate() everywhere instead of findById().
 *   This auto-creates the activity record if it doesn't exist yet
 *   (e.g. for newly registered users who haven't done anything yet).
 *   This prevents "activity not found" errors across the app.
 */
const activityRepository = {
    /**
     * getOrCreate — Get the activity record, creating a blank one if missing.
     *
     * WHY: New users won't have an activity record until they do something.
     * Instead of sprinkling null checks everywhere, we auto-create it here.
     *
     * @param {string|ObjectId} userId - Must match a User._id (same ObjectId)
     * @returns {Document} Existing or newly created UserActivity document
     */
    getOrCreate: async (userId) => {
        let activity = await UserActivity.findById(userId);
        if (!activity) {
            // Create blank record with the user's ID as _id
            activity = await UserActivity.create({
                _id: userId,        // Must match User._id exactly
                wishlisted: [],
                listed: [],
                sold: [],
                img: null
            });
        }
        return activity;
    },

    /**
     * getAll — Retrieve ALL activity records.
     * Used for admin cleanup scripts (e.g. removing orphaned records).
     *
     * @returns {Document[]} All UserActivity documents
     */
    getAll: async () => {
        return await UserActivity.find({});
    },

    /**
     * ensureAll — Ensure every user in the list has an activity record.
     * Sequential loop (not parallel) to avoid duplicate-key race conditions.
     * Used during migration or seeding.
     *
     * @param {ObjectId[]} userIds - Array of User ObjectIds
     */
    ensureAll: async (userIds) => {
        for (const userId of userIds) {
            await activityRepository.getOrCreate(userId); // Sequential: avoid race conditions
        }
    },

    /**
     * update — Partially update a user's activity record.
     *
     * Uses { returnDocument: 'after' } which is a MongoDB driver option.
     * In Mongoose, the preferred way is { new: true }. Both work here.
     *
     * @param {string|ObjectId} userId - Activity document _id (= User._id)
     * @param {Object}          patch  - Fields to update, e.g. { img: 'https://...' }
     * @returns {Document} Updated UserActivity document
     */
    update: async (userId, patch) => {
        return await UserActivity.findByIdAndUpdate(userId, patch, { returnDocument: 'after' });
    },

    /**
     * addListed — Record that a user created a new listing.
     *
     * $addToSet = MongoDB operator that adds to array only if not already present.
     * This prevents duplicates even if called multiple times with the same product.
     * upsert: true = create the activity record if it doesn't exist yet.
     *
     * @param {ObjectId} userId    - The seller's User._id
     * @param {ObjectId} productId - The newly created Product._id
     */
    addListed: async (userId, productId) => {
        return await UserActivity.findByIdAndUpdate(
            userId,
            { $addToSet: { listed: productId } }, // $addToSet prevents duplicates
            { returnDocument: 'after', upsert: true } // upsert creates if missing
        );
    },

    /**
     * markSold — Record that a product was sold by this user.
     *
     * Called when a seller clicks "Mark as Sold" → productService.updateProductStatus()
     * Also triggers removeFromAllWishlists() to clean up everyone's saved items.
     *
     * @param {ObjectId} userId    - The seller's User._id
     * @param {ObjectId} productId - The Product._id that was sold
     */
    markSold: async (userId, productId) => {
        return await UserActivity.findByIdAndUpdate(
            userId,
            { $addToSet: { sold: productId } },
            { returnDocument: 'after', upsert: true }
        );
    },

    /**
     * removeProductEverywhereOnDelete — Full cleanup when a product is permanently deleted.
     *
     * When a student deletes their own listing (hard delete from DB):
     * - Remove from ALL users' wishlisted arrays (other users may have saved it)
     * - Remove from the seller's listed array
     * - Remove from the seller's sold array (if it was already sold)
     *
     * updateMany updates ALL documents in the collection simultaneously.
     * $pull = MongoDB operator that removes matching elements from arrays.
     *
     * @param {ObjectId} productId - The deleted Product._id
     */
    removeProductEverywhereOnDelete: async (productId) => {
        await UserActivity.updateMany({}, {
            $pull: {
                wishlisted: productId,
                listed: productId,
                sold: productId
            }
        });
    },

    /**
     * removeFromAllWishlists — Remove a product from every user's wishlist.
     *
     * Used when a product is marked sold or soft-deleted by admin.
     * The product document still exists in DB (unlike hard delete),
     * so we only clean up wishlists — not listed/sold arrays.
     *
     * The query { wishlisted: productId } only targets documents that
     * actually contain this product (more efficient than updateMany+empty $pull).
     *
     * @param {ObjectId} productId - The Product._id to remove from all wishlists
     */
    removeFromAllWishlists: async (productId) => {
        await UserActivity.updateMany(
            { wishlisted: productId },         // Only update docs that have this product
            { $pull: { wishlisted: productId } } // Remove it from their array
        );
    }
};

module.exports = activityRepository;
