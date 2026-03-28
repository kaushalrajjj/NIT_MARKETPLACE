const mongoose = require('mongoose');

/**
 * Product Model — MongoDB Schema for marketplace listings
 * ────────────────────────────────────────────────────────
 * Every item listed for sale on the marketplace is a Product document.
 * Stored in the 'products' collection.
 *
 * LISTING LIFECYCLE:
 *   1. Student creates listing → isApproved: false, status: 'available'
 *   2. Admin reviews → approves (isApproved: true) or rejects (status: 'rejected_by_admin')
 *   3. If approved: listing is live on browse page
 *   4. Seller can mark it sold → status: 'sold'
 *   5. Admin or seller can delete it → status: 'deleted_by_admin' or physical deletion
 *
 * WHO CAN SEE IT:
 *   Browse page: only shows isApproved: true AND status: 'available'
 *   Seller's dashboard: shows all their listings in all states
 *   Admin panel: shows everything
 *
 * WHAT CAN BE EDITED AFTER CREATION:
 *   - title, description, price, condition (via PATCH /api/products/:id)
 *   - status (sold/available toggle)
 *   - img (upload new image)
 * 
 * WHAT CANNOT BE CHANGED:
 *   - category (locked at creation — intentional to prevent gaming the browse filters)
 *   - seller (immutable ownership)
 */
const productSchema = new mongoose.Schema({
    // Reference to the student who created this listing
    // ObjectId links to the 'users' (students) collection
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Listing title — short and descriptive
    title: { type: String, required: true, minlength: 2, maxlength: 100 },

    // Full description — what it is, condition details, why selling, etc.
    description: { type: String, required: true, minlength: 3, maxlength: 1000 },

    // Price in Indian Rupees (₹) — min 0 allows free giveaways
    price: { type: Number, required: true, min: 0 },

    // Product category — LOCKED after creation (cannot be changed via update)
    // This prevents a seller from categorizing a phone as "Books" to game filters
    category: {
        type: String,
        required: true,
        enum: ["Books", "Electronics", "Cycle", "Hostel Stuff", "Academic", "Other"]
    },

    // Physical condition of the item
    condition: {
        type: String,
        required: true,
        enum: ["New", "Used", "Damaged", "Lightly Used"]
    },

    // Pickup/delivery location description
    location: { type: String, default: 'Campus' },

    // Moderation flag — false by default, must be set to true by admin before listing goes live
    // Browse page query: { isApproved: true, status: 'available' }
    isApproved: { type: Boolean, default: false },

    // Current state of the listing:
    //   available       → live and purchasable (if also isApproved: true)
    //   sold            → seller marked it as sold, removed from browse
    //   reserved        → seller is holding it for a buyer (future feature)
    //   deleted_by_admin → admin removed it (soft delete — stays for audit trail)
    //   rejected_by_admin → admin rejected it — seller can see reason on dashboard
    status: {
        type: String,
        default: 'available',
        enum: ["available", "sold", "reserved", "deleted_by_admin", "rejected_by_admin"]
    },

    // Cloudinary URL for the product image — null if no image uploaded
    img: { type: String, default: null },

    // Which admin approved/rejected/deleted this listing — for audit trail
    // Null until an admin takes any action
    actionByAdmin: { type: mongoose.Schema.Types.ObjectId, default: null }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
