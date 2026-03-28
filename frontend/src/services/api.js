/**
 * frontend/src/services/api.js
 * ─────────────────────────────
 * This is the frontend's HTTP client layer.
 *
 * WHAT IT IS:
 *   A collection of functions that make HTTP requests to the backend API.
 *   Every time a React component needs to talk to the backend, it calls
 *   a function from this file instead of writing fetch() directly.
 *
 * WHY IT EXISTS:
 *   Without this file, every component would need to manually write:
 *     - The full backend URL
 *     - Authorization headers with the JWT token
 *     - Error handling for non-OK responses
 *     - JSON parsing
 *   This file centralizes all of that in one place.
 *
 * HOW TO USE:
 *   import { api } from '../services/api';
 *   const products = await api.fetchProducts({ category: 'Books' });
 */

// The backend's base URL — set in frontend/.env as VITE_API_URL
// Vite injects VITE_ prefixed variables into the browser bundle at build time
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────────
// authFetch — A smarter version of fetch() for authenticated requests
// ─────────────────────────────────────────────────────────────────
/**
 * Works exactly like window.fetch(), but:
 *   - If the server responds with 401 (token expired or invalid),
 *     it automatically redirects the user to /auth to log in again.
 *
 * @param {string} url - The full URL to fetch
 * @param {object} options - Same options as fetch() (method, headers, body...)
 */
async function authFetch(url, options = {}) {
  const res = await fetch(url, options);

  // 401 = "Not authorized" — the JWT token is expired or invalid
  // Redirect to login page automatically instead of showing a cryptic error
  if (res.status === 401) {
    const json = await res.json().catch(() => ({}));
    if (json.redirect) {
      window.location.href = json.redirect; // hard redirect to /auth
      return;
    }
  }
  return res;
}

// ─────────────────────────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Log in with email + password.
 * Works for both students (@nitkkr.ac.in) and admins (any email).
 * Returns: { _id, name, email, role, token, profileImage }
 */
async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
}

/**
 * Step 1 of sign-up: send OTP to the given email.
 * The email MUST be @nitkkr.ac.in — backend enforces this.
 */
async function sendOtp(email) {
  const res = await fetch(`${API}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to send OTP');
  return json;
}

/**
 * Step 2 of sign-up: verify OTP + create the account.
 * userData includes: name, email, password, rollNo, branch, year, hostel, mobileNo
 */
async function verifyOtpAndRegister(userData, otp) {
  const res = await fetch(`${API}/api/auth/verify-otp-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...userData, otp }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Registration failed');
  return json;
}

/**
 * Step 1 of password change: verify current password → send OTP to registered email.
 * currentPassword is verified by the backend before the OTP is sent.
 */
async function sendPasswordChangeOtp(currentPassword, token) {
  const res = await authFetch(`${API}/api/auth/send-password-change-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // identify who is changing their password
    },
    body: JSON.stringify({ currentPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to send OTP');
  return json;
}

/**
 * Step 2 of password change: verify OTP + save new password.
 * Both admin and student accounts use this same function.
 */
async function verifyOtpAndChangePassword(otp, newPassword, token) {
  const res = await authFetch(`${API}/api/auth/verify-otp-change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ otp, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'OTP verification failed');
  return json;
}

// ─────────────────────────────────────────────────────────────────
// PRODUCT FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the product listing page — supports filters and search.
 * All parameters are optional — passing none returns all approved products.
 *
 * @param {object} filters - { category, minPrice, maxPrice, conditions[], sellerYear, sort, search, sellerId, page }
 */
async function fetchProducts(filters = {}) {
  // Convert the filters object into a URL query string
  // e.g. { category: 'Books', minPrice: 100 } → "category=Books&minPrice=100"
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== '' && val !== null && val !== undefined) {
      // Arrays (like conditions[]) need to be added one value at a time
      if (Array.isArray(val)) val.forEach(v => params.append(key, v));
      else params.set(key, val);
    }
  });

  const res = await fetch(`${API}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

/**
 * Get a single product by its MongoDB ID.
 * Used for the product detail view.
 */
async function fetchSingleProduct(id) {
  const res = await fetch(`${API}/api/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

/**
 * Create a new product listing.
 * data = { title, description, price, category, condition, location }
 */
async function createProduct(data, token) {
  const res = await authFetch(`${API}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create listing');
  return json;
}

/**
 * Update an existing product (must be the seller or admin).
 */
async function updateProduct(id, data, token) {
  const res = await authFetch(`${API}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update listing');
  return json;
}

/**
 * Delete a product by the seller themselves.
 * (Admin deletion uses adminDeleteProduct below)
 */
async function deleteProduct(id, token) {
  const res = await authFetch(`${API}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

/**
 * Upload an image for a product listing.
 * file = a File object from an <input type="file"> element
 */
async function uploadProductImage(productId, file, token) {
  const formData = new FormData();
  formData.append('image', file); // 'image' must match multer's field name on the backend

  const res = await authFetch(`${API}/api/products/${productId}/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    // No Content-Type header — browser sets it automatically with the correct boundary for FormData
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Image upload failed');
  return json;
}

/**
 * Remove a product's image (sets it to null on the backend).
 */
async function removeProductImage(productId, token) {
  const res = await authFetch(`${API}/api/products/${productId}/image`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to remove image');
}

// ─────────────────────────────────────────────────────────────────
// WISHLIST FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Toggle a product in/out of the user's wishlist.
 * The backend handles the add/remove logic — it knows if the item is already saved.
 * Returns the updated wishlisted array.
 */
async function syncWishlist(productId, token) {
  const res = await authFetch(`${API}/api/products/${productId}/wishlist`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update wishlist');
  return json;
}

/**
 * Get the full list of products the user has wishlisted.
 * Returns an array of product objects (not just IDs).
 */
async function fetchWishlist(token) {
  const res = await authFetch(`${API}/api/users/me/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load wishlist');
  return res.json();
}

// ─────────────────────────────────────────────────────────────────
// USER PROFILE FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Get the current user's full profile from the database.
 * (The AuthContext only stores a slim version — this has all fields)
 */
async function fetchMe(token) {
  const res = await authFetch(`${API}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

/**
 * Update editable contact fields on the user's profile.
 * data = { mobileNo, whatsappNo, secondaryEmail }
 */
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

/**
 * Upload a new profile avatar (profile photo).
 * The old avatar is automatically deleted from Cloudinary by the backend.
 * Returns { img: 'https://cloudinary.com/...' }
 */
async function uploadAvatar(file, token) {
  const formData = new FormData();
  formData.append('avatar', file); // 'avatar' must match multer's field name on the backend

  const res = await authFetch(`${API}/api/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Avatar upload failed');
  return json;
}

/**
 * Get the user's activity: { listed: [...], sold: [...], wishlisted: [...], img: '...' }
 * Also contains the profile avatar URL (stored in UserActivity, not User).
 */
async function fetchActivity(token) {
  const res = await authFetch(`${API}/api/users/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load activity');
  return res.json();
}

// ─────────────────────────────────────────────────────────────────
// ADMIN FUNCTIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Get ALL products (including pending, rejected, deleted) — admin only.
 */
async function adminGetProducts(token) {
  const res = await authFetch(`${API}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load admin products');
  return res.json();
}

/**
 * Approve or reject a product listing.
 * approve = true → approve | approve = false → reject
 */
async function adminApproveProduct(id, approve, token) {
  const res = await authFetch(`${API}/api/admin/products/${id}/approve`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ approve }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update product');
  return json;
}

/**
 * Permanently delete a product listing — admin only.
 */
async function adminDeleteProduct(id, token) {
  const res = await authFetch(`${API}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

/**
 * Get platform-wide stats: total students, listings, pending count, etc.
 */
async function adminGetStats(token) {
  const res = await authFetch(`${API}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

// ─────────────────────────────────────────────────────────────────
// EXPORT
// Named export as 'api' object — import { api } from './api'
// ─────────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login,
  sendOtp,
  verifyOtpAndRegister,
  sendPasswordChangeOtp,
  verifyOtpAndChangePassword,
  // Products
  fetchProducts,
  fetchSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  removeProductImage,
  // Wishlist
  syncWishlist,
  fetchWishlist,
  // User Profile
  fetchMe,
  updateMe,
  uploadAvatar,
  fetchActivity,
  // Admin
  adminGetProducts,
  adminApproveProduct,
  adminDeleteProduct,
  adminGetStats,
};
