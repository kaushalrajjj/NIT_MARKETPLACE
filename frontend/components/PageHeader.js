export function PageHeader({title = 'My Dashboard',description = 'Track your selling activity and manage your listings.',breadcrumbText = 'My Dashboard', actionText = '✚ Sell an Item',actionUrl = '/sell',showAction = true
} = {}) {
    return `
    <div class="page-hdr">
        <div class="inner" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div class="breadcrumb">
                    <a href="/">🏠 Home</a>
                    ❯
                    <span class="cur">${breadcrumbText}</span>
                </div>
                <h1>${title}</h1>
                <p>${description}</p>
            </div>
            ${showAction ? `
            <a href="${actionUrl}" class="btn btn-blue btn-lg"
                style="background: var(--pri); font-weight: 700; text-decoration: none; padding: 15px 30px; border-radius: 12px; color: #fff;">
                ${actionText}
            </a>
            ` : ''}
        </div>
    </div>
    `;
}
