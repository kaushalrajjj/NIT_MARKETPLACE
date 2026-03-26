import React from 'react';

export default function ChangePasswordCard({ currentPass, newPass, confirmPass, saving, onCurrent, onNew, onConfirm, onSave }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <h3 className="font-bold text-ink mb-1"> Change Password</h3>
      <p className="text-xs text-ink-3 mb-4">Enter current password to set a new one.</p>
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-ink-2 mb-1.5">Current Password</label>
          <input type="password" value={currentPass} onChange={e => onCurrent(e.target.value)} placeholder="Enter current password"
            className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-ink-2 mb-1.5">New Password</label>
            <input type="password" value={newPass} onChange={e => onNew(e.target.value)} placeholder="Min. 6 characters"
              className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-2 mb-1.5">Confirm Password</label>
            <input type="password" value={confirmPass} onChange={e => onConfirm(e.target.value)} placeholder="Repeat new password"
              className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
          </div>
        </div>
      </div>
      <button onClick={onSave} disabled={saving}
        className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:bg-red-300 transition-colors">
        {saving ? 'Updating…' : 'Update Password'}
      </button>
    </div>
  );
}
