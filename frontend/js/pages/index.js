import { initNavigation } from '../utils/navigation-utils.js';

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
