import React from 'react';
import ThemedIcon from '../../components/ThemedIcon';
import { useTheme } from '../../services/ThemeContext';

export default function SellHeader({ isEditMode }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-14 h-14 bg-pri-light rounded-2xl flex items-center justify-center text-3xl">
        {isEditMode
          ? <ThemedIcon name="edit" size={28} color={theme.pri} />
          : <ThemedIcon name="sell" size={28} color={theme.pri} />}
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{isEditMode ? 'Edit Listing' : 'List a New Item'}</h1>
        <p className="text-sm text-pri/70">{isEditMode ? 'Update the details of your listing below.' : 'Fill in the details to reach NIT KKR students.'}</p>
      </div>
    </div>
  );
}
