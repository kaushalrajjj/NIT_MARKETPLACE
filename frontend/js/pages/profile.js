import { apiService } from '../services/apiService.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { initToast } from '../../components/Toast.js';

// ─── AUTH GUARD ───────────────────────────────────────────────────────────────
const userInfo = apiService.getUserInfo();
if (!userInfo) window.location.href = '/auth';

const TOKEN = userInfo?.token;

// ─── NON-CHANGEABLE FIELD LABELS ─────────────────────────────────────────────
const COLLEGE_FIELDS = [
    { key: 'name',          label: 'Full Name',       icon: '👤' },
    { key: 'rollNo',        label: 'Roll Number',      icon: '🎫' },
    { key: 'branch',        label: 'Branch',           icon: '📐' },
    { key: 'year',          label: 'Year',             icon: '📅' },
    { key: 'hostel',        label: 'Current Hostel',   icon: '🏠' },
    { key: 'email',         label: 'College Email',    icon: '✉️' },
];

// ─── RENDER COLLEGE INFO GRID ─────────────────────────────────────────────────
function renderCollegeInfo(user) {
    const grid = document.getElementById('collegeInfoGrid');
    if (!grid) return;
    grid.innerHTML = COLLEGE_FIELDS.map(f => {
        const val = user[f.key] ?? '—';
        return `
            <div class="info-item">
                <span class="info-icon">${f.icon}</span>
                <div>
                    <div class="info-label">${f.label}</div>
                    <div class="info-value">${val}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ─── RENDER AVATAR CARD ───────────────────────────────────────────────────────
function renderAvatarCard(user, activity) {
    const initial = (user.name || '?').charAt(0).toUpperCase();
    document.getElementById('avName').textContent = user.name || '—';
    document.getElementById('avRoll').textContent = user.rollNo  || '';
    document.getElementById('avRole').textContent =
        user.role === 'admin' ? 'Administrator' : `${user.branch || 'NIT KKR'} · Year ${user.year || '?'}`;

    document.getElementById('statListings').textContent = (activity?.listed?.length)      ?? 0;
    document.getElementById('statSold').textContent     = (activity?.sold?.length)        ?? 0;
    document.getElementById('statWish').textContent     = (activity?.wishlisted?.length)  ?? 0;

    // Show image if stored, otherwise initials
    setAvatarDisplay(activity?.img || null, initial);
}

/**
 * Update the av-circle to show either an <img> or the initial letter.
 */
function setAvatarDisplay(imgFilename, initial) {
    const circle = document.getElementById('avCircle');
    if (!circle) return;
    if (imgFilename) {
        const src = imgFilename;
        circle.innerHTML = `<img src="${src}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        circle.style.background = 'transparent';
        circle.style.padding = '0';
    } else {
        circle.textContent = initial || '?';
        circle.style.background = '';
        circle.style.padding = '';
    }
}

// ─── FILL CONTACT FORM FROM USER DATA ────────────────────────────────────────
function fillContactForm(user) {
    document.getElementById('fldPhone').value    = user.mobileNo    || '';
    document.getElementById('fldWhatsapp').value = user.whatsappNo  || '';
}

// ─── SAVE CONTACT ─────────────────────────────────────────────────────────────
window.saveContact = async () => {
    const btn = document.getElementById('saveContactBtn');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
        await apiService.updateMe({
            mobileNo:       document.getElementById('fldPhone').value.trim(),
            whatsappNo:     document.getElementById('fldWhatsapp').value.trim()
        }, TOKEN);
        window.showToast?.('Contact info saved ✅', 'success');
    } catch (err) {
        window.showToast?.(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Save Contact Info';
    }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────
window.changePassword = async () => {
    const currentPass = document.getElementById('fldCurrentPass').value;
    const newPass     = document.getElementById('fldNewPass').value;
    const confirmPass = document.getElementById('fldConfirmPass').value;

    if (!currentPass || !newPass || !confirmPass) {
        window.showToast?.('Please fill in all password fields.', 'error');
        return;
    }
    if (newPass !== confirmPass) {
        window.showToast?.('New passwords do not match.', 'error');
        return;
    }
    if (newPass.length < 12) {
        window.showToast?.('New password must be at least 12 characters.', 'error');
        return;
    }

    const btn = document.getElementById('changePassBtn');
    btn.disabled = true;
    btn.textContent = 'Updating…';
    try {
        await apiService.changePassword(currentPass, newPass, TOKEN);
        window.showToast?.('Password updated successfully 🔑', 'success');
        // Clear all password fields
        document.getElementById('fldCurrentPass').value = '';
        document.getElementById('fldNewPass').value     = '';
        document.getElementById('fldConfirmPass').value = '';
    } catch (err) {
        window.showToast?.(err.message || 'Failed to update password.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🔑 Update Password';
    }
};

// ─── AVATAR UPLOAD ────────────────────────────────────────────────────────────
window.handleAvatarUpload = async (input) => {
    const file = input.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        const circle = document.getElementById('avCircle');
        if (circle) {
            circle.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            circle.style.background = 'transparent';
            circle.style.padding = '0';
        }
    };
    reader.readAsDataURL(file);

    // Upload to backend
    const formData = new FormData();
    formData.append('avatar', file);
    try {
        const res = await fetch('/api/users/me/avatar', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${TOKEN}` },
            body: formData
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Upload failed');
        window.showToast?.('Profile photo updated ✅', 'success');
        
        // Sync to localStorage so sidebar/etc update
        const currentInfo = apiService.getUserInfo();
        if (currentInfo) {
            currentInfo.profileImage = json.img;
            localStorage.setItem('userInfo', JSON.stringify(currentInfo));
        }

        // Update with the server URL (stable)
        setAvatarDisplay(json.img, null);
    } catch (err) {
        window.showToast?.(err.message, 'error');
    } finally {
        input.value = ''; // reset so same file can be re-selected
    }
};



// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initToast();

    try {
        // Fetch full profile and activity in parallel
        const [user, activity] = await Promise.all([
            apiService.fetchMe(TOKEN),
            fetch('/api/users/activity', {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            }).then(r => r.ok ? r.json() : {})
        ]);

        renderAvatarCard(user, activity);
        renderCollegeInfo(user);
        fillContactForm(user);
    } catch (err) {
        console.error('[profile] Load error:', err);
        window.showToast?.('Failed to load profile data.', 'error');
    }
});
