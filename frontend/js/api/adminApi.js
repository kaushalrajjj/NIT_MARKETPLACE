export async function fetchPendingListings(token) {
    const response = await fetch('/api/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
}

export async function approveListing(id, approve, token) {
    return await fetch(`/api/admin/approve/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve })
    });
}

export async function fetchUsers(token) {
    const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
}

export async function fetchStats(token) {
    const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
}
