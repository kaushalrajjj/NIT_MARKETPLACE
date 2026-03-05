export async function fetchProducts(queryParams = '') {
    const response = await fetch(`/api/products?${queryParams}`);
    return await response.json();
}

export async function fetchMyProducts(token) {
    const response = await fetch('/api/products/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
}

export async function fetchLatestProducts() {
    const response = await fetch('/api/products');
    const products = await response.json();
    return products.slice(0, 4);
}

export async function markAsSold(id, token) {
    return await fetch(`/api/products/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'sold' })
    });
}

export async function deleteProduct(id, token) {
    return await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

export async function fetchPublicStats() {
    const response = await fetch('/api/products/stats/public');
    return await response.json();
}
