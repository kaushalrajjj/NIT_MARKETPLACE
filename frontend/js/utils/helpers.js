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
