import { apiService } from '../services/apiService.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { initToast } from '../../components/Toast.js';

/**
 * Sell/Edit Page Logic:
 * Handles listing creation, editing, and photo uploads to Cloudinary.
 */

// ─── AUTH GUARD ───────────────────────────────────────────────────────────────
// Only authenticated users can list items.
const userInfo = apiService.getUserInfo();
if (!userInfo) window.location.href = '/auth';

// ─── PAGE MODE ────────────────────────────────────────────────────────────────
// If '?edit=ID' is in the URL, the page switches into Update mode.
const editId     = new URLSearchParams(window.location.search).get('edit');
const isEditMode = Boolean(editId);

// ─── DATA STATE ───────────────────────────────────────────────────────────────
let selectedFile     = null;  // Local file chosen via input or drag-drop
let existingImgName  = null;  // Filename of current image (for edit mode)
let removeExisting   = false; // Flag to indicate if existing image should be deleted

// ─── PAGE BOOTSTRAP ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initToast();
    initImageUpload();

    // If editing, load the product data from the server first
    if (isEditMode) {
        await loadProductForEdit(editId);
    }
});

// ─── IMAGE UPLOAD UI & DRAG-DROP ──────────────────────────────────────────────
/** 
 * Initializes the interactive image upload area.
 * Handles: click-to-upload, drag-over effects, and file preview rendering.
 */
function initImageUpload() {
    const input      = document.getElementById('productImg');
    const area       = document.getElementById('imgUploadArea');
    const preview    = document.getElementById('imgPreview');
    const placeholder = document.getElementById('imgPlaceholder');
    const actions    = document.getElementById('imgActions');

    // 1. Native File Input
    input?.addEventListener('change', () => {
        if (input.files[0]) selectFile(input.files[0]);
    });

    // 2. Drag & Drop Events
    area?.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('drag-over');
    });
    area?.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area?.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) selectFile(file);
    });

    /** Process chosen file, validate size, and generate base64 preview */
    function selectFile(file) {
        if (file.size > 4 * 1024 * 1024) {
            window.showToast?.('File too large. Max 4 MB.', 'error');
            return;
        }
        selectedFile   = file;
        removeExisting = false;
        
        const reader   = new FileReader();
        reader.onload  = (e) => {
            preview.src          = e.target.result;
            preview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
            if (actions)    actions.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    /** UI Trigger to open file explorer */
    window.changePhoto = () => document.getElementById('productImg')?.click();

    /** Wipe current selection and show placeholder again */
    window.removePhoto = () => {
        selectedFile      = null;
        removeExisting    = true;
        if (preview)      { preview.src = ''; preview.style.display = 'none'; }
        if (placeholder)  placeholder.style.display = 'flex';
        if (actions)      actions.style.display = 'none';
        const input = document.getElementById('productImg');
        if (input) input.value = '';
    };
}

// ─── EDIT MODE DATA LOADER ───────────────────────────────────────────────────
/** 
 * Fetches existing product data, verifies ownership, 
 * and populates the form fields for editing.
 */
async function loadProductForEdit(productId) {
    try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const p = await res.json();

        // Security check: Only original seller can edit
        const sellerId = p.seller?._id || p.seller;
        if (sellerId !== userInfo._id) {
            window.showToast?.('You can only edit your own listings.', 'error');
            setTimeout(() => window.location.href = '/dashboard', 1500);
            return;
        }

        // Change UI text to "Edit" instead of "Sell"
        document.getElementById('sellPageTitle').textContent = 'Edit Listing';
        document.getElementById('sellPageSub').textContent   = 'Update the details of your listing below.';
        document.getElementById('sellHeroIcon').textContent  = '✏️';
        document.getElementById('submitBtn').textContent     = '💾 Update Listing';

        // Pre-fill form
        document.getElementById('title').value       = p.title       || '';
        document.getElementById('price').value       = p.price       ?? '';
        document.getElementById('description').value = p.description || '';

        const condSel = document.getElementById('condition');
        if (condSel) condSel.value = p.condition || '';

        // Category is locked after creation to prevent system-hopping
        const catSel = document.getElementById('category');
        if (catSel) {
            catSel.value    = p.category || '';
            catSel.disabled = true;
        }

        // Load existing product image into preview
        if (p.img) {
            existingImgName = p.img;
            const preview     = document.getElementById('imgPreview');
            const placeholder = document.getElementById('imgPlaceholder');
            const actions     = document.getElementById('imgActions');
            if (preview) {
                preview.src           = `/product-images/${p.img}`;
                preview.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
            if (actions)     actions.style.display = 'flex';
        }

    } catch (err) {
        window.showToast?.('Failed to load listing: ' + err.message, 'error');
    }
}

// ─── IMAGE SYNC ───────────────────────────────────────────────────────────────
/** Sends the actual binary file to the server for Cloudinary upload */
async function uploadProductImage(productId) {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile);
    const res = await fetch(`/api/products/${productId}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userInfo.token}` },
        body: formData
    });
    if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message || 'Image upload failed');
    }
}

/** Tells server to remove the current image link */
async function removeProductImage(productId) {
    await fetch(`/api/products/${productId}/image`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
    });
}

// ─── FORM SUBMISSION ──────────────────────────────────────────────────────────
/** 
 * Handles 'Create' or 'Update' API calls.
 * 1. POST/PUT the text data (metadata).
 * 2. If metadata succeeds, POST the image file.
 * 3. Redirect to dashboard.
 */
document.getElementById('sellForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ── CLIENT-SIDE VALIDATION ──────────────────────────────────────────────
    const title       = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const price       = document.getElementById('price').value;
    const condition   = document.getElementById('condition').value;
    const category    = !isEditMode ? document.getElementById('category').value : null;

    if (title.length < 3) {
        window.showToast?.('Title must be at least 3 characters.', 'error');
        return;
    }
    if (description.length < 10) {
        window.showToast?.('Description must be at least 10 characters.', 'error');
        return;
    }
    if (!price || Number(price) <= 0) {
        window.showToast?.('Please enter a valid price.', 'error');
        return;
    }
    if (!condition) {
        window.showToast?.('Please select a condition.', 'error');
        return;
    }
    if (!isEditMode && !category) {
        window.showToast?.('Please select a category.', 'error');
        return;
    }
    // ────────────────────────────────────────────────────────────────────────

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled    = true;
    submitBtn.textContent = isEditMode ? 'Saving…' : 'Publishing...';

    const productData = {
        title,
        description,
        price:     Number(price),
        condition,
        ...(!isEditMode && { category })
    };

    try {
        let productId;

        if (isEditMode) {
            // Update existing record
            await apiService.updateProduct(editId, productData, userInfo.token);
            productId = editId;
            // Handle image lifecycle
            if (removeExisting && existingImgName) await removeProductImage(productId);
            if (selectedFile) await uploadProductImage(productId);
        } else {
            // Create new record
            const newProduct = await apiService.create(productData, userInfo.token);
            productId = newProduct._id || newProduct.product?._id;
            // Upload image for the new listing
            if (selectedFile && productId) await uploadProductImage(productId);
        }

        window.showToast?.(isEditMode ? 'Listing updated ✅' : 'Listing published! ✅', 'success');
        setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
    } catch (error) {
        console.error('[sell] Submit error:', error);
        window.showToast?.(error.message || 'Something went wrong', 'error');
        submitBtn.disabled    = false;
        submitBtn.textContent = isEditMode ? '💾 Update Listing' : 'Publish Listing';
    }
});
