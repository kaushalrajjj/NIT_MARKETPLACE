import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../services/ThemeContext';
import ThemedIcon from '../components/ThemedIcon';

export default function SellPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('New');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingImgName, setExistingImgName] = useState(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (isEditMode) loadProduct();
  }, []);

  async function loadProduct() {
    try {
      const p = await api.fetchSingleProduct(editId);
      const sellerId = p.seller?._id || p.seller;
      if (sellerId !== user._id) {
        showToast('You can only edit your own listings.', 'error');
        setTimeout(() => navigate('/dashboard'), 1500);
        return;
      }
      setTitle(p.title || '');
      setPrice(p.price ?? '');
      setDescription(p.description || '');
      setCondition(p.condition || 'New');
      setCategory(p.category || '');
      if (p.img) {
        setExistingImgName(p.img);
        setPreviewUrl(p.img.startsWith('http') ? p.img : `/product-images/${p.img}`);
      }
    } catch (err) {
      showToast('Failed to load listing: ' + err.message, 'error');
    }
  }

  const handleFile = (file) => {
    if (file.size > 4 * 1024 * 1024) {
      showToast('File too large. Max 4 MB.', 'error');
      return;
    }
    setSelectedFile(file);
    setRemoveExisting(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setSelectedFile(null);
    setRemoveExisting(true);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.length < 3) { showToast('Title must be at least 3 characters.', 'error'); return; }
    if (description.length < 10) { showToast('Description must be at least 10 characters.', 'error'); return; }
    if (!price || Number(price) <= 0) { showToast('Please enter a valid price.', 'error'); return; }
    if (!condition) { showToast('Please select a condition.', 'error'); return; }
    if (!isEditMode && !category) { showToast('Please select a category.', 'error'); return; }
    if (!isEditMode && !selectedFile) { showToast('Please upload at least one product photo.', 'error'); return; }
    if (isEditMode && removeExisting && !selectedFile) { showToast('Product must have at least one photo.', 'error'); return; }

    setSubmitting(true);
    const productData = { title, description, price: Number(price), condition };
    if (!isEditMode) productData.category = category;

    try {
      let productId;
      if (isEditMode) {
        await api.updateProduct(editId, productData, user.token);
        productId = editId;
        if (removeExisting && existingImgName) await api.removeProductImage(productId, user.token);
        if (selectedFile) await api.uploadProductImage(productId, selectedFile, user.token);
      } else {
        const newProduct = await api.createProduct(productData, user.token);
        productId = newProduct._id || newProduct.product?._id;
        if (selectedFile && productId) await api.uploadProductImage(productId, selectedFile, user.token);
      }
      showToast(isEditMode ? 'Listing updated' : 'Listing published!', 'success');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-pri-light rounded-2xl flex items-center justify-center text-3xl">
            {isEditMode ? <ThemedIcon name="edit" size={28} color={theme.pri} /> : <ThemedIcon name="sell" size={28} color={theme.pri} />}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{isEditMode ? 'Edit Listing' : 'List a New Item'}</h1>
            <p className="text-sm text-pri/70">{isEditMode ? 'Update the details of your listing below.' : 'Fill in the details to reach NIT KKR students.'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category (locked in edit mode) */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <ThemedIcon name="lock" size={22} className="text-ink-3" />
              <div>
                <div className="font-bold text-ink text-sm">Category
                  <span className="ml-2 px-2 py-0.5 bg-surface-2 text-ink-3 text-xs rounded-full">Fixed after posting</span>
                </div>
                <div className="text-xs text-ink-3">Cannot be changed once live.</div>
              </div>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isEditMode}
              required={!isEditMode}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-pri/20 disabled:bg-bg disabled:text-ink-3"
            >
              <option value="">Select Category</option>
              <option value="Books">Books & Notes</option>
              <option value="Electronics">Electronics</option>
              <option value="Cycle">Cycles & Gear</option>
              <option value="Hostel Stuff">Hostel Essentials</option>
              <option value="Academic">Lab & Academic</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Details */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <ThemedIcon name="edit" size={22} className="text-ink-3" />
              <div>
                <div className="font-bold text-ink text-sm">Listing Details
                  <span className="ml-2 px-2 py-0.5 bg-pri-light text-pri text-xs rounded-full">Can be edited later</span>
                </div>
                <div className="text-xs text-ink-3">You can update these from your dashboard.</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-1.5">Item Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Engineering Mathematics B.S. Grewal" required minLength={2}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-2 mb-1.5">Price (₹)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 500" min="0" required
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-2 mb-1.5">Condition</label>
                  <select value={condition} onChange={e => setCondition(e.target.value)} required
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-pri/20">
                    <option value="New">New</option>
                    <option value="Lightly Used">Lightly Used</option>
                    <option value="Used">Used</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-2 mb-1.5">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required minLength={3}
                  placeholder="Mention details like edition, age, defects..."
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20 resize-none" />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <ThemedIcon name="camera" size={22} className="text-ink-3" />
              <div>
                <div className="font-bold text-ink text-sm">Product Photo
                  <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full">Required</span>
                </div>
                <div className="text-xs text-ink-3">Max 4 MB. jpg, png or webp.</div>
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-pri-mid hover:bg-pri-light/30 transition-all"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <ThemedIcon name="camera" size={32} className="text-ink-3 mb-1" />
                  <div className="text-sm text-ink-3">Click to upload photo</div>
                  <div className="text-xs text-ink-3">or drag & drop</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

            {previewUrl && (
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-xs border border-border rounded-lg text-ink-2 hover:bg-bg flex items-center gap-1.5"><ThemedIcon name="refresh" size={14} /> Change Photo</button>
                <button type="button" onClick={removePhoto} className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50 flex items-center gap-1.5"><ThemedIcon name="trash" size={14} /> Remove</button>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-4 text-white font-extrabold rounded-xl transition-all text-[15px] tracking-wide uppercase disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: submitting ? '#9ca3af' : theme.pri,
              boxShadow: submitting ? 'none' : `0 8px 25px ${theme.pri}55`,
            }}>
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {isEditMode ? 'Saving...' : 'Publishing...'}</>
            ) : (
              <><ThemedIcon name={isEditMode ? 'save' : 'upload'} size={20} color="#ffffff" /> {isEditMode ? 'Update Listing' : 'Publish Listing'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
