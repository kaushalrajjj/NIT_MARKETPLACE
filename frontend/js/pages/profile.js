import { initNavigation } from '../utils/navigation-utils.js';
import { getUserInfo } from '../api/authApi.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();

    const userInfo = getUserInfo();

    // Populate avatar + name
    if (userInfo) {
        const initial = userInfo.name.charAt(0).toUpperCase();
        document.getElementById('avCircle').textContent = initial;
        document.getElementById('avName').textContent = userInfo.name;
        document.getElementById('avRole').textContent =
            userInfo.role === 'admin' ? 'Administrator' : 'NIT KKR Student';
        document.getElementById('fldName').value = userInfo.name || '';
        document.getElementById('fldEmail').value = userInfo.email || '';
    }

    // Load saved extra fields from localStorage
    const saved = JSON.parse(localStorage.getItem('profileExtra') || '{}');
    if (saved.branch) document.getElementById('fldBranch').value = saved.branch;
    if (saved.year) document.getElementById('fldYear').value = saved.year;
    if (saved.phone) document.getElementById('fldPhone').value = saved.phone;
});

window.saveProfile = function () {
    const extra = {
        branch: document.getElementById('fldBranch').value,
        year: document.getElementById('fldYear').value,
        phone: document.getElementById('fldPhone').value,
    };
    localStorage.setItem('profileExtra', JSON.stringify(extra));
    alert('Profile saved!');
};
