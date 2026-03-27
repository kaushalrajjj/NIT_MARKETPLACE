import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

export default function CategorySection({ category, onChange, isEditMode }) {
  return (
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
        onChange={(e) => onChange(e.target.value)}
        disabled={isEditMode}
        required={!isEditMode}
        className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-pri/20 disabled:bg-bg disabled:text-ink-3"
      >
        <option value="">Select Category</option>
        <option value="Books">Books &amp; Notes</option>
        <option value="Electronics">Electronics</option>
        <option value="Cycle">Cycles &amp; Gear</option>
        <option value="Hostel Stuff">Hostel Essentials</option>
        <option value="Academic">Lab &amp; Academic</option>
        <option value="Other">Other</option>
      </select>
    </div>
  );
}
