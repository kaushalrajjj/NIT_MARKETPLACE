const jsonDb = require('../config/jsonDb');

/**
 * Activity Repository — User Activity Data Layer
 * ================================================
 * All reads/writes to userActivity.json go through here.
 * Format: { [userId]: { wishlisted: [], listed: [], sold: [], orderHistory: [] } }
 */
const activityRepository = {
    /** Get the activity record for a user (auto-creates blank entry if missing). */
    getOrCreate(userId) {
        return jsonDb.userActivity.getOrCreate(userId);
    },

    /** Get ALL activity records. */
    getAll() {
        return jsonDb.userActivity.getAll();
    },

    /** Ensure every userId in the provided array has an activity entry. */
    ensureAll(userIds) {
        jsonDb.userActivity.ensureAll(userIds);
    },

    /**
     * Partially update a user's activity record.
     * @param {string} userId
     * @param {Object} patch - e.g. { wishlisted: [...] }
     */
    update(userId, patch) {
        return jsonDb.userActivity.update(userId, patch);
    },

    /** Add a product to a user's listed array (when they create a listing). */
    addListed(userId, productId) {
        const activity = this.getOrCreate(userId);
        const listed = activity.listed || [];
        if (!listed.includes(productId)) {
            this.update(userId, { listed: [...listed, productId] });
        }
    },

    /** Mark a product as sold for the seller. */
    markSold(userId, productId) {
        const activity = this.getOrCreate(userId);
        const sold = activity.sold || [];
        if (!sold.includes(productId)) {
            this.update(userId, { sold: [...sold, productId] });
        }
    },

    /**
     * When a product is deleted, remove it from ALL users' wishlisted lists
     * and from the seller's listed array.
     */
    removeProductEverywhereOnDelete(productId) {
        jsonDb.userActivity.removeProductFromAll('wishlisted', productId);
        jsonDb.userActivity.removeProductFromAll('listed', productId);
    }
};

module.exports = activityRepository;

