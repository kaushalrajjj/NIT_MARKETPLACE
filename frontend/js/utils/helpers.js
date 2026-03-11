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
