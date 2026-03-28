/**
 * helpers.js — Shared Utility Functions
 * ─────────────────────────────────────────
 * Pure functions used across multiple components.
 * None of these have side effects — they just transform data and return values.
 */

/**
 * getOptimizedImageUrl — Returns a smaller, faster version of a Cloudinary image.
 *
 * Cloudinary supports on-the-fly image transformations via URL parameters.
 * Instead of loading a 4000px image for a 400px thumbnail, we ask Cloudinary
 * to resize/compress it on the fly by injecting transformation params into the URL.
 *
 * Before: https://res.cloudinary.com/xyz/image/upload/myimage.jpg
 * After:  https://res.cloudinary.com/xyz/image/upload/w_400,q_auto,f_auto/myimage.jpg
 *
 * Params used:
 *   w_400   → resize to max 400px wide
 *   q_auto  → automatically choose the best quality/size balance
 *   f_auto  → automatically choose best format (WebP for Chrome, JPEG for Safari, etc.)
 *
 * @param {string} url - The original Cloudinary image URL
 * @param {number} width - Target display width in pixels (default: 400)
 * @returns {string} Optimized URL, or empty string if no URL provided
 */
export function getOptimizedImageUrl(url, width = 400) {
  if (!url) return '';
  // Only transform Cloudinary URLs — other URLs (local paths, other CDNs) pass through untouched
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
}

/**
 * getOriginalImageUrl — Strips transformation params to get the original-quality image.
 *
 * Used when opening an image in the full-screen lightbox.
 * We want full resolution, not the compressed thumbnail version.
 *
 * Example:
 *   Input:  /upload/w_400,q_auto,f_auto/myimage.jpg
 *   Output: /upload/myimage.jpg
 *
 * @param {string} url - A Cloudinary URL (possibly already transformed)
 * @returns {string} URL pointing to the original, untransformed image
 */
export function getOriginalImageUrl(url) {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Regex: match /upload/ followed by any transformation segment (e.g. w_400,q_auto,f_auto/)
    return url.replace(/\/upload\/[^/]+\//, '/upload/');
  }
  return url;
}

/**
 * formatPrice — Format a number as Indian Rupees (₹).
 *
 * Uses the Indian numbering system (lakhs and crores) with commas.
 * Example: 150000 → "₹1,50,000"
 *
 * @param {number} price - Raw price number from the product object
 * @returns {string} Formatted price string with ₹ symbol
 */
export function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

/**
 * formatDate — Convert an ISO date string to a readable date.
 *
 * Example: "2024-03-15T10:30:00Z" → "15 Mar 2024"
 *
 * @param {string} dateStr - ISO date string (from MongoDB's createdAt / updatedAt)
 * @returns {string} Human-readable date in Indian locale format
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
