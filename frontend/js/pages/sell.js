import { apiService } from '../services/apiService.js';
import { initNavigation } from '../utils/navigation-utils.js';
import { initToast } from '../../components/Toast.js';

// ─── AUTH GUARD ───────────────────────────────────────────────────────────────
const userInfo = apiService.getUserInfo();
if (!userInfo) window.location.href = '/auth';

// ─── EDIT MODE DETECTION ──────────────────────────────────────────────────────
const editId     = new URLSearchParams(window.location.search).get('edit');
const isEditMode = Boolean(editId);

// ─── IMAGE STATE ──────────────────────────────────────────────────────────────
let selectedFile     = null;  // File object from input
let existingImgName  = null;  // filename already on server (edit mode)
let removeExisting   = false; // user clicked "Remove" in edit mode

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();
    initToast();
    initImageUpload();

    if (isEditMode) {
        await loadProductForEdit(editId);
    }
});

// ─── IMAGE UPLOAD UI ─────────────────────────────────────────────────────────
function initImageUpload() {
    const input      = document.getElementById('productImg');
    const area       = document.getElementById('imgUploadArea');
    const preview    = document.getElementById('imgPreview');
    const placeholder = document.getElementById('imgPlaceholder');
    const actions    = document.getElementById('imgActions');

    // File input change
    input?.addEventListener('change', () => {
        if (input.files[0]) selectFile(input.files[0]);
    });

    // Drag & drop
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

    window.changePhoto = () => document.getElementById('productImg')?.click();

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

// ─── LOAD PRODUCT DATA (EDIT MODE) ───────────────────────────────────────────
async function loadProductForEdit(productId) {
    try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const p = await res.json();

        // Verify ownership
        const sellerId = p.seller?._id || p.seller;
        if (sellerId !== userInfo._id) {
            window.showToast?.('You can only edit your own listings.', 'error');
            setTimeout(() => window.location.href = '/dashboard', 1500);
            return;
        }

        // Update page heading
        document.getElementById('sellPageTitle').textContent = 'Edit Listing';
        document.getElementById('sellPageSub').textContent   = 'Update the details of your listing below.';
        document.getElementById('sellHeroIcon').textContent  = '✏️';
        document.getElementById('submitBtn').textContent     = '💾 Update Listing';

        // Pre-fill editable fields
        document.getElementById('title').value       = p.title       || '';
        document.getElementById('price').value       = p.price       ?? '';
        document.getElementById('description').value = p.description || '';

        const condSel = document.getElementById('condition');
        if (condSel) condSel.value = p.condition || '';


        // Lock category
        const catSel = document.getElementById('category');
        if (catSel) {
            catSel.value    = p.category || '';
            catSel.disabled = true;
        }

        // Show existing image if any
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

// ─── UPLOAD IMAGE TO BACKEND ──────────────────────────────────────────────────
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

async function removeProductImage(productId) {
    await fetch(`/api/products/${productId}/image`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
    });
}

// ─── FORM SUBMIT ─────────────────────────────────────────────────────────────
document.getElementById('sellForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled    = true;
    submitBtn.textContent = isEditMode ? 'Saving…' : 'Publishing...';

    const productData = {
        title:       document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        price:       Number(document.getElementById('price').value),
        condition:   document.getElementById('condition').value,
        ...(!isEditMode && { category: document.getElementById('category').value })
    };

    try {
        let productId;

        if (isEditMode) {
            await apiService.updateProduct(editId, productData, userInfo.token);
            productId = editId;
            // Handle image changes in edit mode
            if (removeExisting && existingImgName) await removeProductImage(productId);
            if (selectedFile) await uploadProductImage(productId);
        } else {
            const newProduct = await apiService.create(productData, userInfo.token);
            productId = newProduct._id || newProduct.product?._id;
            // Upload image for new listing
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
