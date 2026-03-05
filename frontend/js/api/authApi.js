export async function login(email, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return await response.json();
}

export function logout() {
    localStorage.removeItem('userInfo');
    window.location.href = '/auth';
}

export function getUserInfo() {
    const info = localStorage.getItem('userInfo');
    return info ? JSON.parse(info) : null;
}
