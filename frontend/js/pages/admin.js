import { apiService } from '../services/apiService.js';
import { initToast } from '../../components/Toast.js';
import { getEmoji } from '../utils/helpers.js';

const userInfo = apiService.getUserInfo();
if (!userInfo || userInfo.role !== 'admin') {
    window.location.href = '/auth'; // Redirect if not admin
}

const TOKEN = userInfo?.token;
let allProducts = [];

function getStatusBadge(status) {
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
    const countBox = document.getElementById('totalProductsCount');

    countBox.textContent = allProducts.length;
    
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

            return `
            <div class="pc" style="${isDeleted ? 'opacity:0.6;' : ''}">
                <div class="pimg" style="background:#f1f5f9;">${thumb}</div>
                <div class="pbody">
                    ${getStatusBadge(p.status)}
                    <div class="ctitle" style="font-size:1rem;">${p.title}</div>
                    <div class="pprice">₹${p.price.toLocaleString('en-IN')}</div>
                    <div class="admin-pc-meta">
                        <strong>Seller:</strong><br>${sellerInfo}<br><br>
                        <strong>Posted:</strong> ${new Date(p.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div class="p-actions" style="padding:14px; padding-top:0; display:flex; gap:8px">
                    <button class="btn btn-danger" style="flex:1; font-size:0.8rem;" 
                            onclick="window.deleteProductAdmin('${p._id}')" ${isDeleted ? 'disabled' : ''}>
                        ${isDeleted ? 'Already Deleted' : 'Delete Product'}
                    </button>
                </div>
            </div>`;
        }).join('');
    }
    load.style.display = 'none';
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

window.deleteProductAdmin = async (id) => {
    if (!confirm('Are you sure you want to delete this product? The seller will see it as "Deleted by Admin".')) return;
    try {
        await apiService.adminDeleteProduct(id, TOKEN);
        window.showToast?.('Product deleted successfully', 'success');
        await fetchProducts(); // Refresh list
    } catch (err) {
        window.showToast?.('Failed to delete product', 'error');
    }
};

window.logout = () => {
    apiService.logout();
};

document.addEventListener('DOMContentLoaded', () => {
    initToast();
    fetchProducts();
});
