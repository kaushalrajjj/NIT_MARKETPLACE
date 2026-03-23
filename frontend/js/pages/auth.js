import { apiService } from '../services/apiService.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { getToastHTML, initToast } from '../../components/Toast.js';



/**
 * Authentication Logic:
 * Handles user login and domain-specific email validation.
 */

/** 
 * Client-side validation for NIT Kurukshetra official emails.
 * Only allows addresses ending with '@nitkkr.ac.in'.
 */
window.validateEmail = (input, prefix) => {
    const isValid = input.value.endsWith('@nitkkr.ac.in');
    const err = document.getElementById(`${prefix}EmailErr`);
    if (err) {
        if (!isValid && input.value.length > 0) {
            err.classList.add('show');
            input.classList.add('error');
        } else {
            err.classList.remove('show');
            input.classList.remove('error');
        }
    }
};

/** 
 * Primary Login Handler:
 * 1. Submits credentials to the backend.
 * 2. Caches the JWT token and user info in localStorage.
 * 3. Redirects to Admin or Home page based on user role.
 */
window.handleLogin = async (e) => {
    if (e) e.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim();
    const pass = document.getElementById('loginPass')?.value.trim();

    if (!email || !pass) {
        window.showToast('Please enter both email and password', 'error');
        return;
    }

    // UI Loading state
    const btn = document.getElementById('loginBtn');
    const txt = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    if (txt) txt.style.display = 'none';
    if (spinner) spinner.style.display = 'block';
    if (btn) btn.disabled = true;

    try {
        const data = await apiService.login(email, pass);
        if (data.token) {
            // Save session
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.showToast('Login success', 'success');
            
            // Wait slightly for the toast to be seen before redirecting
            setTimeout(() => {
                if (data.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            }, 800);
        } else {
            window.showToast(data.message || 'Some error occurred', 'error');
            if (txt) txt.style.display = 'block';
            if (spinner) spinner.style.display = 'none';
            if (btn) btn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        window.showToast('Some error occurred', 'error');
        if (txt) txt.style.display = 'block';
        if (spinner) spinner.style.display = 'none';
        if (btn) btn.disabled = false;
    }
};

/** 
 * Initialize page-specific UI state on load.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('auth-body');
    initNavigation();

    const toastRoot = document.getElementById('toast-root');
    if (toastRoot) toastRoot.innerHTML = getToastHTML();
    initToast();
});
