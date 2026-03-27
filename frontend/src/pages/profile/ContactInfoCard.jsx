import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';

export default function ContactInfoCard({ phone, whatsapp, secEmail, saving, onPhone, onWhatsapp, onSecEmail, onSave }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
        <ThemedIcon name="phone" size={20} className="text-pri" fill /> Contact Info
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-ink-2 mb-1.5">Phone Number</label>
          <input type="tel" value={phone} onChange={e => onPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"
            className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink-2 mb-1.5">WhatsApp Number</label>
          <input type="tel" value={whatsapp} onChange={e => onWhatsapp(e.target.value)} placeholder="91XXXXXXXXXX (no +)"
            className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-ink-2 mb-1.5">Secondary Email</label>
          <input type="email" value={secEmail} onChange={e => onSecEmail(e.target.value)} placeholder="personal@gmail.com"
            className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-bg text-ink focus:outline-none focus:ring-2 focus:ring-pri/20" />
        </div>
      </div>
      <button onClick={onSave} disabled={saving}
        className="px-5 py-2.5 bg-pri text-white text-sm font-semibold rounded-xl hover:bg-pri-dark disabled:bg-pri/60 transition-colors">
        {saving ? 'Saving…' : 'Save Contact Info'}
      </button>
    </div>
  );
}
