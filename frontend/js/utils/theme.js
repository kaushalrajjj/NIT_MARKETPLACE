/**
 * Theme Management Utility
 * Handles dynamic CSS variable updates and theme persistence.
 */

const lightBaseBase = {
    '--bg': '#F5F7FC',
    '--surface': '#FFFFFF',
    '--surface-2': '#F0F4FF',
    '--border': '#DDE4F0',
    '--text': '#0D1B2A',
    '--text-2': '#3B4A5A',
    '--text-3': '#7A8FA6'
};

const themes = {
    blue: {
        ...lightBaseBase,
        '--pri': '#2563EB',
        '--pri-dark': '#1D4ED8',
        '--pri-deep': '#1E3A8A',
        '--pri-light': '#EFF6FF',
        '--pri-mid': '#BFDBFE'
    },
    orange: {
        ...lightBaseBase,
        '--pri': '#F97316',
        '--pri-dark': '#EA580C',
        '--pri-deep': '#9A3412',
        '--pri-light': '#FFF7ED',
        '--pri-mid': '#FED7AA',
        '--surface-2': '#FFF7ED',
        '--border': '#FED7AA'
    },
    cyan: {
        ...lightBaseBase,
        '--pri': '#00BCD4',
        '--pri-dark': '#008BA3',
        '--pri-deep': '#005666',
        '--pri-light': '#E0F7FA',
        '--pri-mid': '#B2EBF2',
        '--surface-2': '#E0F7FA',
        '--border': '#B2EBF2'
    },
    periwinkle: {
        ...lightBaseBase,
        '--pri': '#6C5CE7',
        '--pri-dark': '#4A35B8',
        '--pri-deep': '#32207A',
        '--pri-light': '#F0EDFF',
        '--pri-mid': '#D3C9FF',
        '--surface-2': '#F0EDFF',
        '--border': '#D3C9FF'
    },
    green: {
        ...lightBaseBase,
        '--pri': '#10B981',
        '--pri-dark': '#047857',
        '--pri-deep': '#064E3B',
        '--pri-light': '#ECFDF5',
        '--pri-mid': '#A7F3D0',
        '--surface-2': '#ECFDF5',
        '--border': '#A7F3D0'
    },
    purple: {
        ...lightBaseBase,
        '--pri': '#8B5CF6',
        '--pri-dark': '#6D28D9',
        '--pri-deep': '#4C1D95',
        '--pri-light': '#F5F3FF',
        '--pri-mid': '#DDD6FE',
        '--surface-2': '#F5F3FF',
        '--border': '#DDD6FE'
    },
    red: {
        ...lightBaseBase,
        '--pri': '#E11D48',
        '--pri-dark': '#BE123C',
        '--pri-deep': '#881337',
        '--pri-light': '#FFF1F2',
        '--pri-mid': '#FECDD3',
        '--surface-2': '#FFF1F2',
        '--border': '#FECDD3'
    },
    'cosmic-grad': {
        ...lightBaseBase,
        '--pri': '#D946EF',
        '--pri-dark': '#C026D3',
        '--pri-deep': '#701A75',
        '--pri-light': '#FDF4FF',
        '--pri-mid': '#F5D0FE',
        '--surface-2': '#FDF4FF',
        '--border': '#F5D0FE',
        '--primary-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
    },
    'dark-navy': {
        '--pri': '#3B82F6',
        '--pri-dark': '#2563EB',
        '--pri-deep': '#1D4ED8',
        '--pri-light': '#1E3A8A',
        '--pri-mid': '#1E40AF',
        '--bg': '#0F172A',
        '--surface': '#1E293B',
        '--surface-2': '#334155',
        '--border': '#475569',
        '--text': '#F8FAFC',
        '--text-2': '#CBD5E1',
        '--text-3': '#94A3B8',
        '--primary-gradient': 'linear-gradient(140deg, #1E293B 0%, #1E40AF 100%)',
        '--nav-bg': '#2563EB'
    },
    'dark-cyber': {
        '--pri': '#06B6D4',
        '--pri-dark': '#0891B2',
        '--pri-deep': '#164E63',
        '--pri-light': '#151B2B',
        '--pri-mid': '#164E63',
        '--bg': '#000000',
        '--surface': '#111111',
        '--surface-2': '#1A1A1A',
        '--border': '#333333',
        '--text': '#E5E7EB',
        '--text-2': '#9CA3AF',
        '--text-3': '#6B7280',
        '--primary-gradient': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        '--nav-bg': '#0891B2'
    }
};

/**
 * Apply a theme to the document and save to localStorage
 */
window.setTheme = function(themeName) {
    const theme = themes[themeName] || themes.blue;
    document.documentElement.style.removeProperty('--nav-bg');
    for (const [property, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(property, value);
    }
    
    // For gradients, apply to specific variable for the icon and hero
    if (theme['--primary-gradient']) {
        document.documentElement.style.setProperty('--theme-icon-bg', theme['--primary-gradient']);
        document.documentElement.style.setProperty('--hero-bg-grad', theme['--primary-gradient']);
    } else {
        document.documentElement.style.setProperty('--theme-icon-bg', theme['--pri']);
        document.documentElement.style.removeProperty('--hero-bg-grad');
    }

    localStorage.setItem('site_theme', themeName);

    // Update active circle UI
    document.querySelectorAll('.theme-dot').forEach((btn) => {
        btn.classList.remove('active');
        if (themeName && btn.getAttribute('onclick')?.includes(themeName)) {
            btn.classList.add('active');
        }
    });
};

/**
 * Toggle the theme sub-sidebar visibility
 */
window.toggleThemeSidebar = function(event) {
    if (event) {
        event.stopPropagation(); // prevent immediate close if document click listener exists
    }
    const themePanel = document.getElementById('themeSubSidebar');
    if (themePanel) {
        themePanel.classList.toggle('open');
    }
};

/**
 * Load the saved theme on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('site_theme') || 'blue';
    window.setTheme(savedTheme);

    // Close the sub-sidebar if clicking outside of it
    document.addEventListener('click', (e) => {
        const themePanel = document.getElementById('themeSubSidebar');
        const triggerBtn = document.querySelector('.theme-circle-btn');
        if (themePanel && themePanel.classList.contains('open')) {
            if (!themePanel.contains(e.target) && (!triggerBtn || !triggerBtn.contains(e.target))) {
                themePanel.classList.remove('open');
            }
        }
    });
});
