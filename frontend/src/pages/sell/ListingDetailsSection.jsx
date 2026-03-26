import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

export default function ListingDetailsSection({ title, price, condition, description, onTitle, onPrice, onCondition, onDescription }) {
  return (
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
          <input type="text" value={title} onChange={e => onTitle(e.target.value)}
            placeholder="e.g. Engineering Mathematics B.S. Grewal" required minLength={2}
            className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink-2 mb-1.5">Price (₹)</label>
            <input type="number" value={price} onChange={e => onPrice(e.target.value)}
              placeholder="e.g. 500" min="0" required
              className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-2 mb-1.5">Condition</label>
            <select value={condition} onChange={e => onCondition(e.target.value)} required
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
          <textarea value={description} onChange={e => onDescription(e.target.value)} rows={4} required minLength={3}
            placeholder="Mention details like edition, age, defects..."
            className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20 resize-none" />
        </div>
      </div>
    </div>
  );
}
