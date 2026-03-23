import { initNavigation } from '../utils/navigation-utils.js';

/**
 * Landing Page Logic:
 * Handles scroll animations and navigation initialization.
 */

/** 
 * Initialize IntersectionObserver for 'Scroll Reveal' animations.
 * Elements with class '.rv' fade in when they enter the viewport.
 */
function initScrollReveal() {
    const rvEls = document.querySelectorAll('.rv');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                // Staggered delay for multiple elements appearing at once
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

/** 
 * Add shadow to navigation bar on scroll for better readability against content.
 */
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) {
        nav.style.boxShadow = window.scrollY > 10 ? '0 6px 24px rgba(37,99,235,.12)' : '';
    }
});

/** 
 * Kick off page scripts on load.
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollReveal();
});
