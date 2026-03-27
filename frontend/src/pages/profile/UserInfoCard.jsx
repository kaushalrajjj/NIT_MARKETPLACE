import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

const COLLEGE_FIELDS = [
  { key: 'name',    label: 'Full Name',       iconName: 'profile' },
  { key: 'rollNo',  label: 'Roll Number',     iconName: 'admin' },
  { key: 'branch',  label: 'Branch',          iconName: 'cat-academic' },
  { key: 'year',    label: 'Year',            iconName: 'dashboard' },
  { key: 'hostel',  label: 'Current Hostel',  iconName: 'home' },
  { key: 'email',   label: 'Email Address',   iconName: 'email' },
  { key: 'phone',   label: 'Phone Number',    iconName: 'phone' },
];

export default function UserInfoCard({ profile }) {
  const { theme } = useTheme();
  
  // Filter fields to only show those that have a non-empty value in profile
  const availableFields = COLLEGE_FIELDS.filter(f => {
    const val = profile?.[f.key];
    return val !== undefined && val !== null && val !== '';
  });

  if (availableFields.length === 0) return null;

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <h3 className="font-bold text-ink mb-4 flex items-center gap-2">
        <ThemedIcon name="profile" size={20} className="text-pri" /> User Info
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableFields.map(f => (
          <div key={f.key} className="flex items-center gap-3 p-3 bg-bg rounded-xl">
            <ThemedIcon name={f.iconName} size={20} color={theme.pri} className="opacity-90" />
            <div>
              <div className="text-xs text-ink-3 font-medium">{f.label}</div>
              <div className="text-sm font-semibold text-ink-2">{profile?.[f.key]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
