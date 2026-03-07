import { initNavigation } from '../utils/navigation-utils.js';

// Setup Global Functions (needed for inline onclick in legacy HTML)
window.handleSearch = (val) => {
    if (val.trim()) {
        window.location.href = `/browse?search=${encodeURIComponent(val)}`;
    }
};

// Scroll reveal
function initScrollReveal() {
    const rvEls = document.querySelectorAll('.rv');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                e.target.style.transitionDelay = (i * 0.05) + 's';
                e.target.classList.add('vis');
                obs.unobserve(e.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    });
    rvEls.forEach(el => obs.observe(el));
}

// Contact form
window.handleForm = (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = '✔ Sent!';
    btn.style.background = '#059669';
    setTimeout(() => {
        btn.innerHTML = '✈️ Send Message';
        btn.style.background = '';
    }, 3000);
};

// Nav scroll shadow
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) {
        nav.style.boxShadow = window.scrollY > 10 ? '0 6px 24px rgba(37,99,235,.12)' : '';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollReveal();
});
