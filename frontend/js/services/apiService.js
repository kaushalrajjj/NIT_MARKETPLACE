/**
 * Unified API Service layer.
 * All low-level network calls (fetch) are centralized here.
 */
export const apiService = {
    // ─── AUTHENTICATION ──────────────────────────────────────────────────────
    
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

    logout() {
        localStorage.removeItem('userInfo');
        window.location.href = '/auth';
    },

    getUserInfo() {
        const info = localStorage.getItem('userInfo');
        return info ? JSON.parse(info) : null;
    },

    // ─── PRODUCTS ────────────────────────────────────────────────────────────

    async query(payload) {
        // payload = { filters, sort, fields, page, limit }
        const userInfo = this.getUserInfo();
        const headers = { 'Content-Type': 'application/json' };
        
        if (userInfo && userInfo.token) {
            headers['Authorization'] = `Bearer ${userInfo.token}`;
        }
        
        const response = await fetch('/api/products/query', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        return await response.json();
    },

    async create(productData, token) {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        if (!res.ok) throw new Error('Failed to create product');
        return await res.json();
    },

    async fetchMyProducts(token) {
        const response = await fetch('/api/products/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async updateStatus(id, status, token) {
        const res = await fetch(`/api/products/${id}/status`, {
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

    async delete(id, token) {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete product');
        return await res.json();
    },

    async fetchPublicStats() {
        const response = await fetch('/api/products/stats/public');
        return await response.json();
    },

    async syncWishlist(productId, isAdded, token) {
        const res = await fetch('/api/products/wishlist', {
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

    async fetchMe(token) {
        const res = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load profile');
        return await res.json();
    },

    async updateMe(data, token) {
        const res = await fetch('/api/users/me', {
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

    async changePassword(currentPassword, newPassword, token) {
        const res = await fetch('/api/users/me/password', {
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

    async fetchWishlist(token) {
        const res = await fetch('/api/users/me/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load wishlist');
        return await res.json();
    },

    async fetchActivity(token) {
        const res = await fetch('/api/users/activity', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load activity');
        return await res.json();
    },

    async updateProduct(productId, data, token) {
        const res = await fetch(`/api/products/${productId}`, {
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

    async adminGetProducts(token) {
        const res = await fetch('/api/admin/products', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load admin products');
        return await res.json();
    },

    async adminDeleteProduct(id, token) {
        const res = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete product as admin');
        return await res.json();
    },

    async adminGetStats(token) {
        const res = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load admin stats');
        return await res.json();
    },

    async adminApproveProduct(id, approve, token) {
        const res = await fetch(`/api/admin/approve/${id}`, {
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
