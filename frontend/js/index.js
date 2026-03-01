// Mobile nav
function openMob() {
    document.getElementById('mobNav').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeMob() {
    document.getElementById('mobNav').classList.remove('open');
    document.body.style.overflow = '';
}

// Tabs
function setTab(el) {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('on'));
    el.classList.add('on');
}

// Scroll reveal
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

// Wishlist
document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('on');
        const ic = btn.querySelector('i');
        ic.className = btn.classList.contains('on') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    });
});

// Contact form
function handleForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Sent!';
    btn.style.background = '#059669';
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        btn.style.background = '';
    }, 3000);
}

// Nav scroll shadow
window.addEventListener('scroll', () => {
    document.getElementById('nav').style.boxShadow =
        window.scrollY > 10 ? '0 6px 24px rgba(37,99,235,.12)' : '';
});

// Profile Dropdown
function toggleProf() {
    document.getElementById('dropdownMenu').classList.toggle('open');
}

window.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown')) {
        const dd = document.getElementById('dropdownMenu');
        if (dd) dd.classList.remove('open');
    }
});
