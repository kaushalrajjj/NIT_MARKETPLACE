import { apiService } from '../services/apiService.js';
import { initToast, getToastHTML } from '../../components/Toast.js';
import { getEmoji } from '../utils/helpers.js';

const userInfo = apiService.getUserInfo();
if (!userInfo || userInfo.role !== 'admin') {
    window.location.href = '/auth'; // Redirect if not admin
}

const TOKEN = userInfo?.token;
let allProducts = [];

function getStatusBadge(status, isApproved) {
    if (isApproved === false) {
        return '<span class="admin-pc-status status-pending">Pending Approval</span>';
    }
    switch (status) {
        case 'available':
            return '<span class="admin-pc-status status-available">Available</span>';
        case 'sold':
            return '<span class="admin-pc-status status-sold">Sold</span>';
        case 'deleted_by_admin':
            return '<span class="admin-pc-status status-deleted_by_admin">Deleted by Admin</span>';
        default:
            return `<span class="admin-pc-status status-available">${status}</span>`;
    }
}

function renderProducts() {
    const grid = document.getElementById('adminProductsGrid');
    const load = document.getElementById('productsLoading');

    if (allProducts.length === 0) {
        grid.style.display = 'block';
        grid.innerHTML = '<div class="empty-state">No products found.</div>';
    } else {
        grid.style.display = 'grid';
        grid.innerHTML = allProducts.map(p => {
            const thumb = p.img 
                ? `<img src="/product-images/${p.img}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;">`
                : `<span style="font-size:3rem; display:flex; justify-content:center; align-items:center; height:100%;">${getEmoji(p.category)}</span>`;
            
            const sellerInfo = p.seller 
                ? `${p.seller.name} (${p.seller.roll || 'No Roll'}) <br> ${p.seller.email}`
                : 'Unknown Seller';
            
            const isDeleted = p.status === 'deleted_by_admin';
            const isPending = p.isApproved === false;

            return `
            <div class="pc" style="${isDeleted ? 'opacity:0.6;' : ''}">
                <div class="pimg" style="background:#f1f5f9;">${thumb}</div>
                <div class="pbody">
                    ${getStatusBadge(p.status, p.isApproved)}
                    <div class="ctitle" style="font-size:1rem;">${p.title}</div>
                    <div class="pprice">₹${p.price.toLocaleString('en-IN')}</div>
                    <div class="admin-pc-meta">
                        <strong>Seller:</strong><br>${sellerInfo}<br><br>
                        <strong>Posted:</strong> ${new Date(p.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="p-actions" style="padding:14px; padding-top:0; display:flex; flex-direction:column; gap:8px">
                    ${isPending ? `
                        <div style="display:flex; gap:8px; width:100%">
                            <button class="btn btn-blue" style="flex:1; font-size:0.8rem;" 
                                    onclick="window.approveProductAdmin('${p._id}', true)">
                                Approve
                            </button>
                            <button class="btn btn-outline" style="flex:1; font-size:0.8rem;" 
                                    onclick="window.approveProductAdmin('${p._id}', false)">
                                Reject
                            </button>
                        </div>
                    ` : `
                        <button class="btn btn-danger" style="width:100%; font-size:0.8rem;" 
                                onclick="window.deleteProductAdmin('${p._id}')" ${isDeleted ? 'disabled' : ''}>
                            ${isDeleted ? 'Already Deleted' : 'Delete Product'}
                        </button>
                    `}
                </div>
            </div>`;
        }).join('');
    }
    load.style.display = 'none';
}

async function fetchStats() {
    try {
        const stats = await apiService.adminGetStats(TOKEN);
        document.getElementById('totalUsersCount').textContent = stats.totalUsers || 0;
        document.getElementById('liveListingsCount').textContent = stats.liveListings || 0;
        document.getElementById('pendingListingsCount').textContent = stats.pendingListings || 0;
        document.getElementById('totalVolumeCount').textContent = (stats.totalVolume || 0).toLocaleString('en-IN');
        
        // Add color coding to pending
        const pBox = document.getElementById('pendingListingsCount').parentElement;
        if (stats.pendingListings > 0) {
            pBox.classList.add('danger');
        } else {
            pBox.classList.remove('danger');
        }
    } catch (err) {
        console.error('Stats error:', err);
    }
}

async function fetchProducts() {
    try {
        allProducts = await apiService.adminGetProducts(TOKEN);
        renderProducts();
    } catch (err) {
        window.showToast?.('Failed to fetch products', 'error');
        document.getElementById('productsLoading').textContent = 'Error loading products.';
    }
}

window.approveProductAdmin = async (id, approve) => {
    const action = approve ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this product?`)) return;
    try {
        await apiService.adminApproveProduct(id, approve, TOKEN);
        window.showToast?.(`Product ${approve ? 'approved' : 'rejected'} successfully`, 'success');
        await refreshAll();
    } catch (err) {
        window.showToast?.(`Failed to ${action} product`, 'error');
    }
};

window.deleteProductAdmin = async (id) => {
    if (!confirm('Are you sure you want to delete this product? The seller will see it as "Deleted by Admin".')) return;
    try {
        await apiService.adminDeleteProduct(id, TOKEN);
        window.showToast?.('Product deleted successfully', 'success');
        await refreshAll();
    } catch (err) {
        window.showToast?.('Failed to delete product', 'error');
    }
};

async function refreshAll() {
    await Promise.all([fetchProducts(), fetchStats()]);
}

window.logout = () => {
    apiService.logout();
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toast-root').innerHTML = getToastHTML();
    initToast();
    refreshAll();
});
