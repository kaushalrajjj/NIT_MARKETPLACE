/**
 * ProfileCard Component
 * Displays detailed information about a user/seller.
 */
export function ProfileCard(user) {
    let avatarHtml = '';
    if (user.profileImage) {
        const src = user.profileImage.startsWith('http') ? user.profileImage : `/profile-images/${user.profileImage}`;
        avatarHtml = `<img src="${src}" alt="${user.name}" class="pc-avatar-img" 
                           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                      <div class="pc-avatar-placeholder" style="display:none">${(user.name || 'S').charAt(0).toUpperCase()}</div>`;
    } else {
        avatarHtml = `<div class="pc-avatar-placeholder">${(user.name || 'S').charAt(0).toUpperCase()}</div>`;
    }

    return `
        <div class="user-profile-card">
            <div class="up-header">
                <button class="up-close-btn" onclick="closeProfileModal()">✕</button>
                <div class="up-avatar-wrap">${avatarHtml}</div>
                <div class="up-main-info">
                    <h2 class="up-name">${user.name}</h2>
                    <div class="up-roll">Roll No: ${user.rollNo || 'N/A'}</div>
                </div>
            </div>
            
            <div class="up-body">
                <div class="up-info-grid">
                    <div class="up-info-item">
                        <span class="up-info-label">📧 Email</span>
                        <span class="up-info-value">${user.email}</span>
                    </div>
                    <div class="up-info-item">
                        <span class="up-info-label">🎓 Branch</span>
                        <span class="up-info-value">${user.branch || 'N/A'}</span>
                    </div>
                    <div class="up-info-item">
                        <span class="up-info-label">📅 Year</span>
                        <span class="up-info-value">${user.year || 'N/A'}</span>
                    </div>
                    <div class="up-info-item">
                        <span class="up-info-label">🏠 Hostel</span>
                        <span class="up-info-value">${user.hostel || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="up-footer">
                <button class="btn btn-primary" style="width:100%" onclick="window.filterBySeller('${user._id}', '${user.name}')">🛍️ View All Items</button>
            </div>
        </div>
    `;
}
