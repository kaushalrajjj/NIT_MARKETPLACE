/* Theme mode */
const html = document.documentElement;
let dark = localStorage.getItem('theme') === 'dark';

function applyTheme() {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
}
applyTheme();

function toggleTheme() {
    dark = !dark;
    applyTheme();
}

/* Switch between login/signup panels */
function switchTab(type) {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    const forgotCard = document.getElementById('forgotCard');
    const otpCard = document.getElementById('otpCard');

    if (loginCard) loginCard.style.display = type === 'login' ? 'block' : 'none';
    if (signupCard) signupCard.style.display = type === 'signup' ? 'block' : 'none';
    if (forgotCard) forgotCard.style.display = type === 'forgot' ? 'block' : 'none';
    if (otpCard) otpCard.style.display = type === 'otp' ? 'block' : 'none';
}

function showPanel(id) {
    const panels = ['login', 'signup', 'forgot', 'otp'];
    panels.forEach(p => {
        const el = document.getElementById(p + 'Card');
        if (el) el.style.display = p === id ? 'block' : 'none';
    });
}

/* Email validation */
function validateEmail(input, prefix) {
    const val = input.value;
    const hint = document.getElementById(prefix + 'EmailHint');
    const err = document.getElementById(prefix + 'EmailErr');
    if (err) err.classList.remove('show');

    if (!val) {
        if (hint) {
            hint.className = 'email-hint';
            hint.textContent = '';
        }
        input.classList.remove('error');
        return;
    }

    if (val.includes('@') && !val.endsWith('@nitkkr.ac.in')) {
        if (hint) {
            hint.className = 'email-hint';
            hint.style.color = 'var(--acc-red)';
            hint.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Use your <strong>@nitkkr.ac.in</strong> email';
        }
    } else if (val.endsWith('@nitkkr.ac.in')) {
        if (hint) {
            hint.className = 'email-hint success';
            hint.style.color = 'var(--acc-green)';
            hint.innerHTML = '<i class="fa-solid fa-circle-check"></i> Valid campus email';
        }
        input.classList.remove('error');
    } else {
        if (hint) {
            hint.className = 'email-hint';
            hint.textContent = '';
        }
        input.classList.remove('error');
    }
}

/* Password visibility */
function togglePass(id, btn) {
    const inp = document.getElementById(id);
    if (!inp) return;
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    const icon = btn.querySelector('i');
    if (icon) icon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
}

/* Password strength */
function checkStrength(inp) {
    const val = inp.value;
    const ps = document.getElementById('passStrength');
    if (!ps) return;
    if (!val) {
        ps.style.display = 'none';
        return;
    }
    ps.style.display = 'block';
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    const labels = ['Too weak', 'Weak', 'Good', 'Strong'];
    for (let i = 1; i <= 4; i++) {
        const seg = document.getElementById('ps' + i);
        if (seg) seg.style.background = i <= score ? colors[score - 1] : 'var(--border)';
    }
    const psLabel = document.getElementById('psLabel');
    if (psLabel) {
        psLabel.textContent = labels[score - 1] || 'Too weak';
        psLabel.style.color = colors[score - 1] || '#ef4444';
    }
}

/* Signup steps */
let currentStep = 1;

function nextSignupStep(e, step) {
    if (e) e.preventDefault();
    goSignupStep(step);
}

function goSignupStep(step) {
    const currentEl = document.getElementById('signupStep' + currentStep);
    if (currentEl) currentEl.style.display = 'none';
    currentStep = step;
    const nextEl = document.getElementById('signupStep' + step);
    if (nextEl) nextEl.style.display = 'block';
    // Update dots
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById('step' + i + 'dot');
        const lbl = document.getElementById('step' + i + 'lbl');
        if (!dot || !lbl) continue;
        if (i < step) {
            dot.className = 'ss-dot done';
            dot.innerHTML = '<i class="fa-solid fa-check" style="font-size:.65rem"></i>';
            lbl.className = 'ss-label done';
        } else if (i === step) {
            dot.className = 'ss-dot active';
            dot.textContent = i;
            lbl.className = 'ss-label active';
        } else {
            dot.className = 'ss-dot';
            dot.textContent = i;
            lbl.className = 'ss-label';
        }
    }
}

/* Login handler */
function handleLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('loginEmail');
    const pass = document.getElementById('loginPass');
    const emailErr = document.getElementById('loginEmailErr');
    const passErr = document.getElementById('loginPassErr');

    if (email && !email.value.includes('@nitkkr.ac.in')) {
        if (emailErr) emailErr.classList.add('show');
        email.classList.add('error');
        return;
    }
    if (pass && pass.value.length < 8) {
        if (passErr) passErr.classList.add('show');
        pass.classList.add('error');
        return;
    }
    // Simulate loading
    const btn = document.getElementById('loginBtn');
    const txt = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');
    if (txt) txt.style.display = 'none';
    if (spinner) spinner.style.display = 'block';
    if (btn) btn.disabled = true;
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

/* Google login */
function handleGoogle() {
    const btn = document.querySelector('.google-btn');
    if (btn) {
        btn.textContent = 'Signing in…';
        btn.disabled = true;
    }
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1200);
}

/* OTP inputs */
const otpInputEls = () => document.querySelectorAll('.otp-input');

function otpMove(inp, idx) {
    inp.value = inp.value.replace(/[^0-9]/g, '');
    if (inp.value.length === 1) {
        inp.classList.add('filled');
        const inputs = otpInputEls();
        if (idx < 5 && inputs[idx + 1]) inputs[idx + 1].focus();
        if (idx === 5) checkOTPComplete();
    }
}

function otpBack(inp, e, idx) {
    if (e.key === 'Backspace' && !inp.value && idx > 0) {
        const inputs = otpInputEls();
        if (inputs[idx - 1]) {
            inputs[idx - 1].focus();
            inputs[idx - 1].value = '';
            inputs[idx - 1].classList.remove('filled');
        }
    }
}

function checkOTPComplete() {
    const vals = [...otpInputEls()].map(i => i.value).join('');
    if (vals.length === 6) {
        // Auto verify after small delay
    }
}

function verifyOTP() {
    const vals = [...otpInputEls()].map(i => i.value).join('');
    if (vals.length < 6) {
        otpInputEls().forEach(i => {
            if (!i.value) i.classList.add('error');
        });
        return;
    }
    const btn = document.getElementById('verifyBtn');
    if (btn) {
        btn.textContent = 'Verifying…';
        btn.disabled = true;
    }
    setTimeout(() => {
        const successBox = document.getElementById('otpSuccess');
        if (successBox) successBox.className = 'success-box show';
        if (btn) btn.style.display = 'none';
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }, 1200);
}

function toggleProf() {
    const dm = document.getElementById('dropdownMenu');
    if (dm) dm.classList.toggle('open');
}

document.addEventListener('click', e => {
    if (!e.target.closest('.profile-dropdown')) {
        const dd = document.getElementById('dropdownMenu');
        if (dd) dd.classList.remove('open');
    }
});

/* OTP timer */
let otpInterval;

function startOTPTimer() {
    let secs = 30;
    const timerCount = document.getElementById('timerCount');
    const resendLink = document.getElementById('resendLink');
    const resendTimer = document.getElementById('resendTimer');

    if (timerCount) timerCount.textContent = secs;
    if (resendLink) resendLink.style.display = 'none';
    if (resendTimer) resendTimer.style.display = '';

    clearInterval(otpInterval);
    otpInterval = setInterval(() => {
        secs--;
        if (timerCount) timerCount.textContent = secs;
        if (secs <= 0) {
            clearInterval(otpInterval);
            if (resendTimer) resendTimer.style.display = 'none';
            if (resendLink) resendLink.style.display = 'inline';
        }
    }, 1000);
}

function resendOTP() {
    startOTPTimer();
    otpInputEls().forEach(i => {
        i.value = '';
        i.classList.remove('filled', 'error');
    });
    const firstInput = otpInputEls()[0];
    if (firstInput) firstInput.focus();
    // Visual feedback
    const target = document.querySelector('.otp-target');
    if (target) {
        target.style.background = 'var(--acc-green)';
        target.style.color = '#fff';
        target.style.border = 'none';
        target.innerHTML = '<i class="fa-solid fa-circle-check"></i> OTP resent successfully!';
        setTimeout(() => {
            target.style.background = '';
            target.style.color = '';
            target.style.border = '';
            target.innerHTML = `<i class="fa-solid fa-envelope" style="color:var(--pri)"></i><span>OTP sent to <strong>raj.kumar@nitkkr.ac.in</strong></span>`;
        }, 2000);
    }
}

/* Forgot password */
function sendResetLink() {
    const email = document.getElementById('forgotEmail');
    if (email && !email.value.includes('@nitkkr.ac.in')) {
        email.classList.add('error');
        return;
    }
    const forgotForm = document.getElementById('forgotForm');
    const resetSuccess = document.getElementById('resetSuccess');
    if (forgotForm) forgotForm.style.display = 'none';
    if (resetSuccess) resetSuccess.className = 'success-box show';
}
