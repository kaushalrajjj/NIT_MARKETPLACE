/**
 * Unified API Service layer.
 * All low-level network calls (fetch) are centralized here.
 */

/**
 * Wrapper around fetch that auto-handles 401 responses.
 * If any API call returns 401, the user's session is cleared
 * and they are redirected to the login page.
 */
async function authFetch(url, options = {}) {
    const response = await fetch(url, options);
    if (response.status === 401) {
        localStorage.removeItem('userInfo');
        window.location.href = '/auth';
        // Throw to prevent callers from processing the response further
        throw new Error('Session expired. Redirecting to login...');
    }
    return response;
}

export const apiService = {
    // ─── AUTHENTICATION ──────────────────────────────────────────────────────
    
    // ─── AUTHENTICATION ──────────────────────────────────────────────────────
    
    /** Send login credentials and return user info + token */
    async login(email, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    /** Clear user session and redirect to login page */
    logout() {
        localStorage.removeItem('userInfo');
        window.location.href = '/auth';
    },

    /** Retrieve parsed user info from localStorage */
    getUserInfo() {
        const info = localStorage.getItem('userInfo');
        return info ? JSON.parse(info) : null;
    },

    // ─── PRODUCTS ────────────────────────────────────────────────────────────

    /** Generic product search with filters, sorting, and pagination */
    async query(payload) {
        // payload = { filters, sort, fields, page, limit }
        const userInfo = this.getUserInfo();
        const headers = { 'Content-Type': 'application/json' };
        
        if (userInfo && userInfo.token) {
            headers['Authorization'] = `Bearer ${userInfo.token}`;
        }
        
        const response = await authFetch('/api/products/query', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        return await response.json();
    },

    /** Post a new product listing (requires auth) */
    async create(productData, token) {
        const res = await authFetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to create product');
        return json;
    },

    /** Fetch all products listed by the current user */
    async fetchMyProducts(token) {
        const response = await authFetch('/api/products/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    /** Change product availability (Mark as Sold, etc.) */
    async updateStatus(id, status, token) {
        const res = await authFetch(`/api/products/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update status');
        return await res.json();
    },

    /** Permanently remove a product listing */
    async delete(id, token) {
        const res = await authFetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete product');
        return await res.json();
    },

    /** Get global stats (Total users, listings, etc.) */
    async fetchPublicStats() {
        const response = await fetch('/api/products/stats/public');
        return await response.json();
    },

    /** Toggle a product in user's wishlist */
    async syncWishlist(productId, isAdded, token) {
        const res = await authFetch('/api/products/wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, isAdded })
        });
        if (!res.ok) throw new Error('Failed to sync wishlist to backend');
        return await res.json();
    },

    // ─── USER PROFILE ─────────────────────────────────────────────────────────

    /** Fetch private profile data for the current user */
    async fetchMe(token) {
        const res = await authFetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load profile');
        return await res.json();
    },

    /** Update user contact information */
    async updateMe(data, token) {
        const res = await authFetch('/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to update profile');
        return json;
    },

    /** Update account password */
    async changePassword(currentPassword, newPassword, token) {
        const res = await authFetch('/api/users/me/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to change password');
        return json;
    },

    /** Fetch all product objects in the user's wishlist */
    async fetchWishlist(token) {
        const res = await authFetch('/api/users/me/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load wishlist');
        return await res.json();
    },

    /** Get user activity (img, wishlist count, listed count) */
    async fetchActivity(token) {
        const res = await authFetch('/api/users/activity', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load activity');
        return await res.json();
    },

    /** Batch update product details like title or price */
    async updateProduct(productId, data, token) {
        const res = await authFetch(`/api/products/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to update product');
        return json;
    },

    // ─── ADMIN ─────────────────────────────────────────────────────────────

    /** Get EVERY product listing on the platform (Admin only) */
    async adminGetProducts(token) {
        const res = await authFetch('/api/admin/products', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load admin products');
        return await res.json();
    },

    /** Admin tool to force-delete any product listing */
    async adminDeleteProduct(id, token) {
        const res = await authFetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete product as admin');
        return await res.json();
    },

    /** Get admin-level dashboard stats */
    async adminGetStats(token) {
        const res = await authFetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load admin stats');
        return await res.json();
    },

    /** Approve or reject/delete a pending product listing */
    async adminApproveProduct(id, approve, token) {
        const res = await authFetch(`/api/admin/approve/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ approve })
        });
        if (!res.ok) throw new Error('Failed to approve/reject product');
        return await res.json();
    }
};
