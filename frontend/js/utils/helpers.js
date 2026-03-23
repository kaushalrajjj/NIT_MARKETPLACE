/**
 * UI & Data Helpers:
 * Small utility functions used across the application for visual consistency.
 */

/** 
 * Returns a category-specific emoji.
 * used as a fallback when a product doesn't have a real image.
 */
export function getEmoji(cat) {
    const cats = {
        'Books':       '📚',
        'Electronics': '🔌',
        'Cycles':      '🚲',
        'Hostel':      '📦',
        'Tools':       '🛠️',
        'Other':       '✨'
    };
    return cats[cat] || '✨';
}

/** 
 * Automatically appends Cloudinary transformation parameters to a URL.
 * Optimizes performance by requesting the exact width needed (e.g., thumbnails vs. full view).
 * - f_auto, q_auto: Ensures browsers get the best format (WebP/AVIF) and quality.
 * - width: Scales the image down on the server before sending to the client.
 */
export function getOptimizedImageUrl(url, width) {
    if (!url || !url.startsWith('http')) return url;
    if (url.includes('res.cloudinary.com')) {
        const parts = url.split('/upload/');
        if (parts.length === 2) {
            const transform = width ? `f_auto,q_auto,w_${width},c_limit/` : 'f_auto,q_auto/';
            return `${parts[0]}/upload/${transform}${parts[1]}`;
        }
    }
    return url;
}
