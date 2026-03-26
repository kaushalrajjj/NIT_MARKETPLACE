import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

export default function PhotoUploadSection({ previewUrl, fileInputRef, onFileClick, onDrop, onRemove, onFileChange }) {
  return (
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
        onClick={onFileClick}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-pri-mid hover:bg-pri-light/30 transition-all"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <ThemedIcon name="camera" size={32} className="text-ink-3 mb-1" />
            <div className="text-sm text-ink-3">Click to upload photo</div>
            <div className="text-xs text-ink-3">or drag &amp; drop</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={onFileChange}
      />

      {previewUrl && (
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={onFileClick} className="px-3 py-1.5 text-xs border border-border rounded-lg text-ink-2 hover:bg-bg flex items-center gap-1.5">
            <ThemedIcon name="refresh" size={14} /> Change Photo
          </button>
          <button type="button" onClick={onRemove} className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50 flex items-center gap-1.5">
            <ThemedIcon name="trash" size={14} /> Remove
          </button>
        </div>
      )}
    </div>
  );
}
