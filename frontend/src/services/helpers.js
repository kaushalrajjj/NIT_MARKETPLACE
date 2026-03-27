
export function getOptimizedImageUrl(url, width = 400) {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
}

// Returns the original Cloudinary image without any transformation params.
export function getOriginalImageUrl(url) {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Strip any transformation segment like /upload/w_400,q_auto,f_auto/ → /upload/
    return url.replace(/\/upload\/[^/]+\//, '/upload/');
  }
  return url;
}

export function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
