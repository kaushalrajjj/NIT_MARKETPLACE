import { login, logout, getUserInfo } from '../api/authApi.js';
import { applyTheme, toggleTheme } from '../utils/helpers.js';
import { checkAuth, updateGlobalAvatars } from '../utils/auth-helper.js';
import { initNavigation } from '../utils/navigation-utils.js';

// Global exports for legacy HTML onclick
window.toggleTheme = toggleTheme;
window.logout = logout;
window.handleLogin = async (e) => {
    if (e) e.preventDefault();
    const email = document.getElementById('loginEmail');
    const pass = document.getElementById('loginPass');

    if (!email?.value || !pass?.value) {
        alert('Please enter both email and password');
        return;
    }

    const btn = document.getElementById('loginBtn');
    const txt = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    if (txt) txt.style.display = 'none';
    if (spinner) spinner.style.display = 'block';
    if (btn) btn.disabled = true;

    try {
        const data = await login(email.value, pass.value);
        if (data.token) {
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = data.role === 'admin' ? '/admin' : '/dashboard';
        } else {
            alert(data.message || 'Login failed');
            if (txt) txt.style.display = 'block';
            if (spinner) spinner.style.display = 'none';
            if (btn) btn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
        if (txt) txt.style.display = 'block';
        if (spinner) spinner.style.display = 'none';
        if (btn) btn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const dark = localStorage.getItem('theme') === 'dark';
    applyTheme(dark);
    initNavigation();
    checkAuth();
    updateGlobalAvatars();
});
