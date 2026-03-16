import { renderProductCard } from '../../components/productCard.js';

/**
 * BrowseUI — Pure DOM rendering for the Browse page.
 * Receives plain data, no state objects.
 */
export const browseUI = {

    renderProducts({ products, total, filters = {} }) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const resCount = document.getElementById('resultsCount');
        if (resCount) resCount.textContent = total ?? products.length;

        // Update results label text
        const resLabel = document.getElementById('resultsLabel');
        if (resLabel) {
            const labelText = filters.sellerName 
                ? `items by "${filters.sellerName}"` 
                : (filters.category && filters.category !== 'all' ? `"${filters.category}"` : '"All Items"');
            resLabel.textContent = labelText;
        }

        grid.innerHTML = products.length === 0
            ? '<div class="empty-state">No products found matching your criteria.</div>'
            : products.map(p => renderProductCard(p, true)).join('');
    },

    renderActiveFilters(filters, handlers) {
        const container = document.getElementById('activeFilters');
        if (!container) return;

        const { category = '', minPrice, maxPrice, condition = '', search = '', sellerName = '' } = filters;
        let html = '';

        if (category && category !== 'all')
            html += `<span class="filter-chip">${category} <span style="cursor:pointer" id="removeCat">✕</span></span>`;

        if (minPrice || maxPrice)
            html += `<span class="filter-chip">₹${minPrice || '0'} – ₹${maxPrice || 'Any'} <span style="cursor:pointer" id="removePrice">✕</span></span>`;

        if (condition)
            html += `<span class="filter-chip">Condition: ${condition.replace(/,/g, ', ')} <span style="cursor:pointer" id="removeCondition">✕</span></span>`;

        if (search)
            html += `<span class="filter-chip">Search: ${search} <span style="cursor:pointer" id="removeSearch">✕</span></span>`;

        if (sellerName)
            html += `<span class="filter-chip">Seller: ${sellerName} <span style="cursor:pointer" id="removeSeller">✕</span></span>`;

        if (html)
            html += `<button class="filter-reset" id="clearAllFilters" style="margin-left:8px">Clear all</button>`;

        container.innerHTML = html;

        document.getElementById('removeCat')?.addEventListener('click', handlers.onRemoveCategory);
        document.getElementById('removePrice')?.addEventListener('click', handlers.onRemovePrice);
        document.getElementById('removeCondition')?.addEventListener('click', handlers.onRemoveCondition);
        document.getElementById('removeSearch')?.addEventListener('click', handlers.onRemoveSearch);
        document.getElementById('removeSeller')?.addEventListener('click', handlers.onRemoveSeller);
        document.getElementById('clearAllFilters')?.addEventListener('click', handlers.onClearAll);
    },

    updateSortLabel(label) {
        const lbl = document.getElementById('sortLbl');
        if (lbl) lbl.textContent = label;
    }
};
