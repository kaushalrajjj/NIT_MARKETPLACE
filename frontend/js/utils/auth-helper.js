import { logout, getUserInfo } from '../api/authApi.js';

export function checkAuth() {
    const user = getUserInfo();
    const path = window.location.pathname;

    if (user) {
        if (path === '/auth' || path.endsWith('auth.html')) {
            window.location.href = user.role === 'admin' ? '/admin' : '/dashboard';
        }
    } else {
        const protectedRoutes = ['/dashboard', '/admin', '/chat', '/sell'];
        if (protectedRoutes.some(r => path === r || path.includes(r + '.html'))) {
            window.location.href = '/auth';
        }
    }
}

export function updateGlobalAvatars() {
    const user = getUserInfo();
    if (!user) return;

    const initial = user.name.charAt(0).toUpperCase();
    const avatars = document.querySelectorAll('.profile-avatar');
    avatars.forEach(av => {
        av.textContent = initial;
        av.style.background = 'var(--pri)';
        av.style.color = '#fff';
    });
}
