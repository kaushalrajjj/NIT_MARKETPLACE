import { initNavigation } from '../utils/navigation-utils.js';
import { getEmoji } from '../utils/helpers.js';
import { PageHeader } from '../../components/PageHeader.js';
import {
    getWishlist,
    removeFromWishlist,
    clearWishlistStorage,
    toggleWishlist,
    isWishlisted
} from '../utils/wishlist-utils.js';

// Re-export for backward-compat (other pages that imported from wishlist.js)
export { toggleWishlist, isWishlisted };

// ─── Page render ───────────────────────────────────────────────────────────────

function renderCard(product) {
    const emoji = getEmoji ? getEmoji(product.category) : '📦';
    return `
        <div class="pc" id="wc-${product._id}">
            <div class="pimg">
                ${emoji}
                <span class="pcond">${product.condition || 'Used'}</span>
                <button class="premove" title="Remove from wishlist"
                        onclick="removeItem('${product._id}')">
                    💔
                </button>
            </div>
            <div class="pbody">
                <div class="pcat">${product.category || 'General'}</div>
                <div class="ptitle">${product.title}</div>
                <div class="pprice">₹${product.price?.toLocaleString('en-IN') ?? '—'}</div>
                <div class="pmeta">
                    <span>📍 ${product.location || 'NIT KKR'}</span>
                </div>
            </div>
            <div class="pfoot">
                <button class="pbtn pbtn-contact">💬 Contact</button>
                <button class="pbtn pbtn-view" onclick="window.location='/browse'">🏪 Browse</button>
            </div>
        </div>
    `;
}

function renderEmpty() {
    return `
        <div class="empty-state">
            ❤️
            <h3>Your wishlist is empty</h3>
            <p>Save items you're interested in and come back to them anytime.</p>
            <a href="/browse" class="browse-btn">🏪 Browse Items</a>
        </div>
    `;
}

function render() {
    const list = getWishlist();
    const grid = document.getElementById('wgrid');
    const count = document.getElementById('wCount');
    if (!grid) return;
    if (count) count.textContent = list.length;
    grid.innerHTML = list.length
        ? list.map(renderCard).join('')
        : renderEmpty();
}

window.removeItem = function (id) {
    removeFromWishlist(id);
    render();
};

window.clearWishlist = function () {
    if (getWishlist().length === 0) return;
    if (confirm('Remove all saved items?')) {
        clearWishlistStorage();
        render();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    
    // Inject Page Header
    const hdrContainer = document.getElementById('page-header-root');
    if (hdrContainer) {
        hdrContainer.innerHTML = PageHeader({
            title: '❤️ My Wishlist',
            description: "Items you've saved — buy them before they're gone!",
            breadcrumbText: 'Wishlist',
            showAction: false
        });
    }

    render();
});

// Keep in sync if another tab changed the wishlist
window.addEventListener('wishlistChanged', render);
