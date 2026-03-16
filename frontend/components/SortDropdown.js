export function SortDropdown(
{
    options = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Price: Low to High', value: 'price_low' },
        { label: 'Price: High to Low', value: 'price_high' }
    ],
    defaultActiveLabel = 'Newest First',
    idSuffix = '',
    onSelectFunctionName = 'setSort'
} = {}) {

    // Generate the options HTML dynamically
    const optionsHtml = options.map((opt) => {
        const label = typeof opt === 'string' ? opt : opt.label;
        const value = typeof opt === 'string' ? opt : opt.value;
        const isActive = label === defaultActiveLabel ? 'active' : '';
        return `<div class="sort-opt ${isActive}" onclick="${onSelectFunctionName}(this, '${value}', '${label}')">${label}</div>`;
    }).join('');

    return `
        <div class="sort-wrap" id="sw${idSuffix}">
            <button class="sort-btn" onclick="toggleSort()">Sort: <span id="sortLbl${idSuffix}">${defaultActiveLabel}</span> ˅ </button>
            <div class="sort-menu">
                ${optionsHtml}
            </div>
        </div>
    `;
}

