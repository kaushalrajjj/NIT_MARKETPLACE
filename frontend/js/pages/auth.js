import { apiService } from '../services/apiService.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { getToastHTML, initToast } from '../../components/Toast.js';



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

window.handleLogin = async (e) => {
    if (e) e.preventDefault();
    const email = document.getElementById('loginEmail');
    const pass = document.getElementById('loginPass');

    if (!email?.value || !pass?.value) {
        window.showToast('Please enter both email and password', 'error');
        return;
    }

    const btn = document.getElementById('loginBtn');
    const txt = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    if (txt) txt.style.display = 'none';
    if (spinner) spinner.style.display = 'block';
    if (btn) btn.disabled = true;

    try {
        const data = await apiService.login(email.value, pass.value);
        if (data.token) {
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.showToast('Login success', 'success');
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

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('auth-body');
    initNavigation();

    const toastRoot = document.getElementById('toast-root');
    if (toastRoot) toastRoot.innerHTML = getToastHTML();
    initToast();
});
