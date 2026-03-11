/**
 * Toast component — returns a plain HTML string.
 * Shared across all pages to replace native alerts.
 */
export function getToastHTML() {
    return `
        <div id="toast" class="toast">
            <div class="toast-content">
                <div class="toast-icon" id="toastIcon">✔</div>
                <div class="toast-message" id="toastMsg">Success!</div>
            </div>
            <div class="toast-progress"></div>
        </div>
    `;
}

/**
 * Initialize global toast functionality
 */
export function initToast() {
    window.showToast = (msg, type = 'success') => {
        const t = document.getElementById('toast');
        const m = document.getElementById('toastMsg');
        const icon = document.getElementById('toastIcon');
        
        if (!t || !m) return;

        m.textContent = msg;
        t.className = `toast ${type} show`;
        
        if (icon) {
            if (type === 'success') icon.textContent = '✅';
            else if (type === 'error') icon.textContent = '❌';
            else if (type === 'warn') icon.textContent = '⚠️';
        }

        clearTimeout(t._timer);
        t._timer = setTimeout(() => {
            t.classList.remove('show');
        }, 3000);
    };
}
