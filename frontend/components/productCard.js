import { getEmoji } from '../js/utils/helpers.js';

function productImg(p, size = '3rem') {
    if (p.img) {
        return `<img src="/product-images/${p.img}" alt="${p.title}"
                     style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
    }
    return `<span style="font-size:${size}">${getEmoji(p.category)}</span>`;
}

function sellerAvatar(seller) {
    if (seller?.profileImage) {
        return {
            html: `<img src="/profile-images/${seller.profileImage}" alt="${seller?.name || ''}"
                         style="width:100%;height:100%;object-fit:cover;border-radius:50%">`,
            hasImage: true
        };
    }
    const initial = (seller?.name || 'S').charAt(0).toUpperCase();
    return { html: initial, hasImage: false };
}

export function renderProductCard(p, isBrowse = false) {
    if (isBrowse) {
        const sellerName    = p.seller?.name || 'Seller';
        const sellerRoll    = p.seller?.roll ? ` · ${p.seller.roll}` : '';
        const avatar        = sellerAvatar(p.seller);
        const avatarStyle   = avatar.hasImage
            ? 'background:transparent;padding:0'
            : 'background:var(--pri);color:#fff';

        return `
            <div class="product-card" id="pc-${p._id}" onclick="openModal('${p._id}')">
                <div class="p-img" style="overflow:hidden">
                    ${productImg(p)}
                    <span class="p-badge used">${p.condition}</span>
                    <button class="p-wish-btn"
                            id="wish-${p._id}"
                            title="Save to wishlist"
                            onclick="event.stopPropagation(); window.toggleWish('${p._id}', this)">
                        ♡
                    </button>
                </div>
                <div class="p-body">
                    <div class="p-cat">${p.category}</div>
                    <h3 class="p-title">${p.title}</h3>
                    <div class="p-price-row">
                        <div class="p-price">₹${p.price.toLocaleString('en-IN')}</div>
                        <button class="btn btn-blue">View Details</button>
                    </div>
                    <div class="p-footer">
                        <div class="p-seller">
                            <div class="p-seller-img" style="${avatarStyle}">
                                ${avatar.html}
                            </div>
                            <div class="p-seller-name">${sellerName}<span class="p-seller-roll">${sellerRoll}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Home page card
    const homeAvatar      = sellerAvatar(p.seller);
    const homeAvatarStyle = homeAvatar.hasImage
        ? 'background:transparent;padding:0'
        : 'background:var(--pri);color:#fff';

    return `
        <div class="card rv">
            <div class="card-img" style="background:var(--pri-light);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative">
                ${productImg(p, '3rem')}
                <span class="cond cond-new">${p.condition}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title" style="margin:10px 0; font-size:1.1rem; color:var(--text); font-weight:700">${p.title}</h3>
                <div class="card-price" style="font-size:1.25rem; color:var(--pri); font-weight:800; margin-bottom:15px">₹${p.price.toLocaleString('en-IN')}</div>
                <div class="card-seller">
                    <div class="p-seller-img" style="${homeAvatarStyle}">
                        ${homeAvatar.html}
                    </div>
                    <div>
                        <div class="s-name">${p.seller?.name || 'Seller'}</div>
                        <div class="s-branch">NIT KKR Student</div>
                    </div>
                </div>
                <div class="card-btns">
                    <button class="btn btn-blue" style="flex:1" onclick="window.location.href='/browse'">View More Details</button>
                </div>
            </div>
        </div>
    `;
}


