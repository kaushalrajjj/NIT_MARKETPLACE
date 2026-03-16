const UserActivity = require('../models/UserActivity');

/** Activity Repository — User Activity Data Layer */
const activityRepository = {
    /** Get the activity record for a user (auto-creates blank entry if missing). */
    getOrCreate: async (userId) => {
        let activity = await UserActivity.findById(userId);
        if (!activity) {
            activity = await UserActivity.create({ 
                _id: userId,
                wishlisted: [],
                listed: [],
                sold: [],
                img: null
            });
        }
        return activity;
    },

    /** Get ALL activity records. */
    getAll: async () => {
        return await UserActivity.find({});
    },

    /** Ensure every userId in the provided array has an activity entry. */
    ensureAll: async (userIds) => {
        for (const userId of userIds) {
            await activityRepository.getOrCreate(userId);
        }
    },

    /**
     * Partially update a user's activity record.
     * @param {string} userId
     * @param {Object} patch - e.g. { wishlisted: [...] }
     */
    update: async (userId, patch) => {
        return await UserActivity.findByIdAndUpdate(userId, patch, { new: true });
    },

    /** Add a product to a user's listed array (when they create a listing). */
    addListed: async (userId, productId) => {
        return await UserActivity.findByIdAndUpdate(
            userId, 
            { $addToSet: { listed: productId } }, 
            { new: true, upsert: true }
        );
    },

    /** Mark a product as sold for the seller. */
    markSold: async (userId, productId) => {
        return await UserActivity.findByIdAndUpdate(
            userId, 
            { $addToSet: { sold: productId } }, 
            { new: true, upsert: true }
        );
    },

    /**
     * When a product is deleted, remove it from ALL users' wishlisted lists
     * and from the seller's listed array.
     */
    removeProductEverywhereOnDelete: async (productId) => {
        await UserActivity.updateMany({}, {
            $pull: {
                wishlisted: productId,
                listed: productId,
                sold: productId
            }
        });
    }
};

module.exports = activityRepository;

