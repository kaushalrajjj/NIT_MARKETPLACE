import { login, logout, getUserInfo } from '../api/authApi.js';
import { checkAuth, updateGlobalAvatars } from '../utils/auth-helper.js';
import { initNavigation } from '../utils/navigation-utils.js';

// Global exports for legacy HTML onclick
window.toggleProf = () => {
    document.getElementById('dropdownMenu')?.classList.toggle('open');
};

window.showPanel = (panelId) => {
    document.getElementById('loginCard').style.display = panelId === 'login' ? 'block' : 'none';
    document.getElementById('signupCard').style.display = panelId === 'signup' ? 'block' : 'none';
    document.getElementById('forgotCard').style.display = panelId === 'forgot' ? 'block' : 'none';
};

window.togglePass = (inputId, btn) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🔒';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
};

window.switchTab = (tab) => {
    window.showPanel(tab);
};

window.validateEmail = (input, prefix) => {
    const isValid = input.value.endsWith('@nitkkr.ac.in');
    const hint = document.getElementById(`${prefix}EmailHint`);
    const err = document.getElementById(`${prefix}EmailErr`);
    if (hint) {
        if (isValid) {
            hint.textContent = 'Valid NIT email';
            hint.className = 'email-hint success';
        } else if (input.value.length > 0) {
            hint.textContent = 'Must be an @nitkkr.ac.in email address';
            hint.className = 'email-hint';
        } else {
            hint.textContent = '';
        }
    }
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

window.checkStrength = (input) => {
    const val = input.value;
    let strength = 0;
    if (val.length > 7) strength++;
    if (val.length > 10) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;
    
    // update strength UI if needed
};

window.nextSignupStep = (e, step) => {
    if (e) e.preventDefault();
    window.goSignupStep(step);
};

window.goSignupStep = (step) => {
    document.querySelectorAll('[id^="signupStep"]').forEach(el => el.style.display = 'none');
    document.getElementById(`signupStep${step}`).style.display = 'block';
    
    document.querySelectorAll('.ss-dot, .ss-label').forEach(el => el.classList.remove('active'));
    for (let i = 1; i <= step; i++) {
        const dot = document.getElementById(`step${i}dot`);
        const lbl = document.getElementById(`step${i}lbl`);
        if (dot) dot.classList.add('active');
        if (lbl) lbl.classList.add('active');
    }
};

let otpTimer;
window.startOTPTimer = () => {
    let timeLeft = 30;
    const timerEl = document.getElementById('timerCount');
    const resendMsg = document.getElementById('resendTimer');
    const resendLink = document.getElementById('resendLink');
    
    if (timerEl && resendMsg && resendLink) {
        resendMsg.style.display = 'inline';
        resendLink.style.display = 'none';
        
        clearInterval(otpTimer);
        otpTimer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(otpTimer);
                resendMsg.style.display = 'none';
                resendLink.style.display = 'inline';
            }
        }, 1000);
    }
};

window.resendOTP = () => {
    window.startOTPTimer();
    // actual resend logic here
};

window.verifyOTP = () => {
    const success = document.getElementById('otpSuccess');
    if (success) success.style.display = 'block';
    
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 1500);
};

window.otpMove = (input, nextIdx) => {
    if (input.value.length === 1) {
        const next = document.querySelectorAll('.otp-input')[nextIdx + 1];
        if (next) next.focus();
    }
};

window.otpBack = (input, e, prevIdx) => {
    if (e.key === 'Backspace' && input.value === '') {
        const prev = document.querySelectorAll('.otp-input')[prevIdx - 1];
        if (prev) prev.focus();
    }
};

window.sendResetLink = () => {
    const success = document.getElementById('resetSuccess');
    if (success) success.style.display = 'block';
};

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
    initNavigation();
    checkAuth();
    updateGlobalAvatars();
});
