/**
 * wishlist-utils.js
 * Shared wishlist helpers used by browse, wishlist, and dashboard pages.
 * Stores saved products as full objects in localStorage.
 */

const STORAGE_KEY = 'nitkkr_wishlist';

export function getWishlist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function saveWishlist(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Notify other open tabs / same-page listeners
    window.dispatchEvent(new CustomEvent('wishlistChanged'));
}

export function isWishlisted(productId) {
    return getWishlist().some(p => p._id === productId);
}

/**
 * Toggle a product in/out of the wishlist.
 * @param {Object} product – full product object from the API
 * @returns {boolean} true = added, false = removed
 */
export function toggleWishlist(product) {
    const list = getWishlist();
    const idx = list.findIndex(p => p._id === product._id);
    if (idx === -1) {
        list.push(product);
    } else {
        list.splice(idx, 1);
    }
    saveWishlist(list);
    return idx === -1;
}

export function removeFromWishlist(productId) {
    const list = getWishlist().filter(p => p._id !== productId);
    saveWishlist(list);
}

export function clearWishlistStorage() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('wishlistChanged'));
}
