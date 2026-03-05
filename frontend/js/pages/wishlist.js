import { initNavigation } from '../utils/navigation-utils.js';
import { getEmoji } from '../utils/helpers.js';

const STORAGE_KEY = 'nitkkr_wishlist';

function getWishlist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveWishlist(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Called by other pages to toggle a product in/out of the wishlist */
export function toggleWishlist(product) {
    const list = getWishlist();
    const idx = list.findIndex(p => p._id === product._id);
    if (idx === -1) {
        list.push(product);
    } else {
        list.splice(idx, 1);
    }
    saveWishlist(list);
    return idx === -1; // true = added, false = removed
}

export function isWishlisted(productId) {
    return getWishlist().some(p => p._id === productId);
}

// ─── Page render ──────────────────────────────────────────────────────────────

function renderCard(product) {
    const emoji = getEmoji ? getEmoji(product.category) : '📦';
    return `
        <div class="pc">
            <div class="pimg">
                ${emoji}
                <span class="pcond">${product.condition || 'Used'}</span>
                <button class="premove" title="Remove from wishlist"
                        onclick="removeItem('${product._id}')">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="pbody">
                <div class="pcat">${product.category || 'General'}</div>
                <div class="ptitle">${product.title}</div>
                <div class="pprice">₹${product.price?.toLocaleString('en-IN') ?? '—'}</div>
            </div>
            <div class="pfoot">
                <button class="pbtn pbtn-contact"><i class="fa-solid fa-comment"></i> Contact</button>
                <button class="pbtn pbtn-view" onclick="window.location='/browse'"><i class="fa-solid fa-eye"></i></button>
            </div>
        </div>
    `;
}

function renderEmpty() {
    return `
        <div class="empty-state">
            <i class="fa-regular fa-heart"></i>
            <h3>Your wishlist is empty</h3>
            <p>Save items you're interested in and come back to them anytime.</p>
            <a href="/browse" class="browse-btn"><i class="fa-solid fa-store"></i> Browse Items</a>
        </div>
    `;
}

function render() {
    const list = getWishlist();
    const grid = document.getElementById('wgrid');
    const count = document.getElementById('wCount');
    if (!grid) return;
    count.textContent = list.length;
    grid.innerHTML = list.length
        ? list.map(renderCard).join('')
        : renderEmpty();
}

window.removeItem = function (id) {
    const list = getWishlist().filter(p => p._id !== id);
    saveWishlist(list);
    render();
};

window.clearWishlist = function () {
    if (getWishlist().length === 0) return;
    if (confirm('Remove all saved items?')) {
        localStorage.removeItem(STORAGE_KEY);
        render();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    render();
});
