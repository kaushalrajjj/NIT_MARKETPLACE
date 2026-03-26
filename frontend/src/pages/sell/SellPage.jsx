import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { useToast } from '../../components/Toast';
import { useTheme } from '../../services/ThemeContext';
import ThemedIcon from '../../components/ThemedIcon';
import SellHeader from './SellHeader';
import CategorySection from './CategorySection';
import ListingDetailsSection from './ListingDetailsSection';
import PhotoUploadSection from './PhotoUploadSection';

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
    if (file.size > 4 * 1024 * 1024) { showToast('File too large. Max 4 MB.', 'error'); return; }
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
        <SellHeader isEditMode={isEditMode} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <CategorySection category={category} onChange={setCategory} isEditMode={isEditMode} />

          <ListingDetailsSection
            title={title} price={price} condition={condition} description={description}
            onTitle={setTitle} onPrice={setPrice} onCondition={setCondition} onDescription={setDescription}
          />

          <PhotoUploadSection
            previewUrl={previewUrl}
            fileInputRef={fileInputRef}
            onFileClick={() => fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onRemove={removePhoto}
            onFileChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 text-white font-extrabold rounded-xl transition-all text-[15px] tracking-wide uppercase disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: submitting ? '#9ca3af' : theme.pri, boxShadow: submitting ? 'none' : `0 8px 25px ${theme.pri}55` }}
          >
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
