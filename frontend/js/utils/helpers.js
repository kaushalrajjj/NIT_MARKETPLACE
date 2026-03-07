export function getEmoji(cat) {
    const cats = {
        'Books': '📚',
        'Electronics': '🔌',
        'Cycles': '🚲',
        'Hostel': '📦',
        'Tools': '🛠️',
        'Other': '✨'
    };
    return cats[cat] || '✨';
}

export function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}


