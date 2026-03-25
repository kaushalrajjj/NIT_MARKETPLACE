
export function getOptimizedImageUrl(url, width = 400) {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
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
