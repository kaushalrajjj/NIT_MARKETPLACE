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

export function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon') || document.getElementById('themeIco');
    if (icon) icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export function toggleTheme() {
    let dark = localStorage.getItem('theme') === 'dark';
    dark = !dark;
    applyTheme(dark);
}
