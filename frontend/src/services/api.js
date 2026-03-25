/**
 * Unified API Service — React version.
 * Mirrors the original apiService.js endpoints exactly.
 */

const API = '';  // Vite proxy handles /api -> localhost:5000

function getUserInfo() {
  const info = localStorage.getItem('userInfo');
  return info ? JSON.parse(info) : null;
}

function getToken() {
  return getUserInfo()?.token;
}

async function authFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem('userInfo');
    window.location.href = '/auth';
    throw new Error('Session expired. Redirecting to login...');
  }
  return res;
}

// ─── AUTH ───
async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

function logout() {
  localStorage.removeItem('userInfo');
  window.location.href = '/auth';
}

// ─── PRODUCTS ───
async function queryProducts(payload) {
  const userInfo = getUserInfo();
  const headers = { 'Content-Type': 'application/json' };
  if (userInfo?.token) headers['Authorization'] = `Bearer ${userInfo.token}`;
  const res = await authFetch(`${API}/api/products/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function createProduct(productData, token) {
  const res = await authFetch(`${API}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create product');
  return json;
}

async function fetchMyProducts(token) {
  const res = await authFetch(`${API}/api/products/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function updateProductStatus(id, status, token) {
  const res = await authFetch(`${API}/api/products/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

async function deleteProduct(id, token) {
  const res = await authFetch(`${API}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

async function fetchPublicStats() {
  const res = await fetch(`${API}/api/products/stats/public`);
  return res.json();
}

async function syncWishlist(productId, isAdded, token) {
  const res = await authFetch(`${API}/api/products/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, isAdded }),
  });
  if (!res.ok) throw new Error('Failed to sync wishlist');
  return res.json();
}

async function updateProduct(productId, data, token) {
  const res = await authFetch(`${API}/api/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update product');
  return json;
}

async function fetchSingleProduct(productId) {
  const res = await fetch(`${API}/api/products/${productId}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

async function uploadProductImage(productId, file, token) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API}/api/products/${productId}/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const j = await res.json();
    throw new Error(j.message || 'Image upload failed');
  }
}

async function removeProductImage(productId, token) {
  await fetch(`${API}/api/products/${productId}/image`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── USER ───
async function fetchMe(token) {
  const res = await authFetch(`${API}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

async function updateMe(data, token) {
  const res = await authFetch(`${API}/api/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update profile');
  return json;
}

async function changePassword(currentPassword, newPassword, token) {
  const res = await authFetch(`${API}/api/users/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to change password');
  return json;
}

async function fetchWishlist(token) {
  const res = await authFetch(`${API}/api/users/me/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load wishlist');
  return res.json();
}

async function fetchActivity(token) {
  const res = await authFetch(`${API}/api/users/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load activity');
  return res.json();
}

async function uploadAvatar(file, token) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${API}/api/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Upload failed');
  return json;
}

// ─── ADMIN ───
async function adminGetProducts(token) {
  const res = await authFetch(`${API}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load admin products');
  return res.json();
}

async function adminDeleteProduct(id, token) {
  const res = await authFetch(`${API}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete product as admin');
  return res.json();
}

async function adminGetStats(token) {
  const res = await authFetch(`${API}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load admin stats');
  return res.json();
}

async function adminApproveProduct(id, approve, token) {
  const res = await authFetch(`${API}/api/admin/approve/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ approve }),
  });
  if (!res.ok) throw new Error('Failed to approve/reject product');
  return res.json();
}

export const api = {
  getUserInfo,
  getToken,
  login,
  logout,
  queryProducts,
  createProduct,
  fetchMyProducts,
  updateProductStatus,
  deleteProduct,
  fetchPublicStats,
  syncWishlist,
  updateProduct,
  fetchSingleProduct,
  uploadProductImage,
  removeProductImage,
  fetchMe,
  updateMe,
  changePassword,
  fetchWishlist,
  fetchActivity,
  uploadAvatar,
  adminGetProducts,
  adminDeleteProduct,
  adminGetStats,
  adminApproveProduct,
};
