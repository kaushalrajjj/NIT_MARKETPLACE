import { getEmoji } from '../js/utils/helpers.js';

export function renderProductCard(p, isBrowse = false) {
    if (isBrowse) {
        return `
            <div class="product-card" onclick="openModal('${p._id}')">
                <div class="p-img">
                    <span class="p-emoji" style="font-size:3rem">${getEmoji(p.category)}</span>
                    <span class="p-badge used">${p.condition}</span>
                </div>
                <div class="p-body">
                    <div class="p-cat">${p.category}</div>
                    <h3 class="p-title">${p.title}</h3>
                    <div class="p-meta">
                        <span><i class="fa-solid fa-location-dot"></i> ${p.location || 'NIT KKR'}</span>
                    </div>
                    <div class="p-price-row">
                        <div class="p-price">₹${p.price.toLocaleString('en-IN')}</div>
                        <button class="btn btn-blue">View Details</button>
                    </div>
                    <div class="p-footer">
                        <div class="p-seller">
                            <div class="p-seller-img" style="background:var(--pri);color:#fff">${(p.seller?.name || 'S').charAt(0)}</div>
                            <div class="p-seller-name">${p.seller?.name || 'Seller'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Default for Home or other pages
    return `
        <div class="card rv">
            <div class="card-img" style="background:var(--pri-light);font-size:3rem;display:flex;align-items:center;justify-content:center">
                ${getEmoji(p.category)}
                <span class="cond cond-new">${p.condition}</span>
            </div>
            <div class="card-body">
                <div class="card-meta">
                    <span><i class="fa-solid fa-location-dot"></i> ${p.location || 'NIT KKR'}</span>
                </div>
                <h3 class="card-title" style="margin:10px 0; font-size:1.1rem; color:var(--text); font-weight:700">${p.title}</h3>
                <div class="card-price" style="font-size:1.25rem; color:var(--pri); font-weight:800; margin-bottom:15px">₹${p.price.toLocaleString('en-IN')}</div>
                <div class="card-seller">
                    <div class="s-av" style="background:var(--pri);color:#fff">${(p.seller?.name || 'S').charAt(0)}</div>
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
