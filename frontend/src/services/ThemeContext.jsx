import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEMES = {
  blue: {
    name: 'Azure Blue', color: '#2563EB',
    pri: '#2563EB', priDark: '#1D4ED8', priDeep: '#1E3A8A', priLight: '#F0F7FF', priMid: '#DBEAFE',
    bg: '#F8FAFC', surface: '#FFFFFF', surface2: '#F1F5F9', border: '#E2E8F0',
    text: '#0F172A', text2: '#475569', text3: '#94A3B8', isDark: false,
  },
  cyan: {
    name: 'Cyan Ocean', color: '#00BCD4',
    pri: '#06B6D4', priDark: '#0891B2', priDeep: '#164E63', priLight: '#ECFEFF', priMid: '#CFFAFE',
    bg: '#F8FAFC', surface: '#FFFFFF', surface2: '#F1F5F9', border: '#E2E8F0',
    text: '#0F172A', text2: '#475569', text3: '#94A3B8', isDark: false,
  },
  green: {
    name: 'Emerald Green', color: '#10B981',
    pri: '#10B981', priDark: '#059669', priDeep: '#064E3B', priLight: '#F0FDF4', priMid: '#DCFCE7',
    bg: '#F8FAF5', surface: '#FFFFFF', surface2: '#F1F9F1', border: '#E2F0E2',
    text: '#064E3B', text2: '#166534', text3: '#65A30D', isDark: false,
  },
  orange: {
    name: 'Sunset Orange', color: '#F97316',
    pri: '#F97316', priDark: '#EA580C', priDeep: '#9A3412', priLight: '#FFF7ED', priMid: '#FFEDD5',
    bg: '#FFFBF5', surface: '#FFFFFF', surface2: '#FFF1E0', border: '#FFD7B5',
    text: '#7C2D12', text2: '#9A3412', text3: '#EA580C', isDark: false,
  },
  red: {
    name: 'Ruby Red', color: '#E11D48',
    pri: '#E11D48', priDark: '#BE123C', priDeep: '#881337', priLight: '#FFF1F2', priMid: '#FFE4E6',
    bg: '#FFF8F8', surface: '#FFFFFF', surface2: '#FFF1F1', border: '#FFE4E4',
    text: '#881337', text2: '#BE123C', text3: '#E11D48', isDark: false,
  },
  yellow: {
    name: 'Golden Yellow', color: '#F59E0B',
    pri: '#F59E0B', priDark: '#D97706', priDeep: '#92400E', priLight: '#FFFBEB', priMid: '#FEF3C7',
    bg: '#FFFDF5', surface: '#FFFFFF', surface2: '#FEFCE8', border: '#FEF08A',
    text: '#78350F', text2: '#92400E', text3: '#D97706', isDark: false,
  },
  pink: {
    name: 'Cherry Blossom', color: '#F472B6',
    pri: '#F472B6', priDark: '#DB2777', priDeep: '#9D174D', priLight: '#FDF2F8', priMid: '#FCE7F3',
    bg: '#FFF9FB', surface: '#FFFFFF', surface2: '#FFF1F6', border: '#FBCFE8',
    text: '#831843', text2: '#9D174D', text3: '#DB2777', isDark: false,
  },
  purple: {
    name: 'Amethyst Purple', color: '#8B5CF6',
    pri: '#8B5CF6', priDark: '#7C3AED', priDeep: '#5B21B6', priLight: '#F5F3FF', priMid: '#EDE9FE',
    bg: '#F9F8FF', surface: '#FFFFFF', surface2: '#F0EEFF', border: '#E5E1FF',
    text: '#4C1D95', text2: '#5B21B6', text3: '#8B5CF6', isDark: false,
  },
  periwinkle: {
    name: 'Periwinkle', color: '#6C5CE7',
    pri: '#6C5CE7', priDark: '#4A35B8', priDeep: '#32207A', priLight: '#F0EDFF', priMid: '#E0DAFF',
    bg: '#F9F8FF', surface: '#FFFFFF', surface2: '#F0EEFF', border: '#E5E1FF',
    text: '#32207A', text2: '#4A35B8', text3: '#6C5CE7', isDark: false,
  },
  'cosmic-grad': {
    name: 'Cosmic Gradient', color: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    pri: '#D946EF', priDark: '#C026D3', priDeep: '#701A75', priLight: '#FDF4FF', priMid: '#F5D0FE',
    bg: '#F5F7FC', surface: '#FFFFFF', surface2: '#FDF4FF', border: '#F5D0FE',
    text: '#0D1B2A', text2: '#3B4A5A', text3: '#7A8FA6', isDark: false,
  },
  'dark-navy': {
    name: 'Midnight Navy', color: 'linear-gradient(135deg, #0F172A 50%, #2563EB 100%)',
    pri: '#2563EB', priDark: '#1D4ED8', priDeep: '#1E40AF', priLight: '#1E3A8A', priMid: '#1E40AF',
    bg: '#0F172A', surface: '#1E293B', surface2: '#334155', border: '#475569',
    text: '#F8FAFC', text2: '#CBD5E1', text3: '#94A3B8', isDark: true,
  },
  'dark-forest': {
    name: 'Midnight Forest', color: 'linear-gradient(135deg, #062016 50%, #10B981 100%)',
    pri: '#10B981', priDark: '#059669', priDeep: '#064E3B', priLight: '#064E3B', priMid: '#065F46',
    bg: '#062016', surface: '#0D2D23', surface2: '#133E31', border: '#1C4F40',
    text: '#F0FDF4', text2: '#A7F3D0', text3: '#6EE7B7', isDark: true,
  },
  'dark-ember': {
    name: 'Midnight Ember', color: 'linear-gradient(135deg, #2D1A10 50%, #F97316 100%)',
    pri: '#F97316', priDark: '#EA580C', priDeep: '#C2410C', priLight: '#7C2D12', priMid: '#9A3412',
    bg: '#1C100B', surface: '#2D1A10', surface2: '#3D2517', border: '#4A2B1D',
    text: '#FFF7ED', text2: '#FED7AA', text3: '#FDBA74', isDark: true,
  },
  'dark-cyber': {
    name: 'Midnight Cyan', color: 'linear-gradient(135deg, #041014 50%, #06B6D4 100%)',
    pri: '#06B6D4', priDark: '#0891B2', priDeep: '#164E63', priLight: '#083344', priMid: '#164E63',
    bg: '#041014', surface: '#0E1F26', surface2: '#162F38', border: '#1D3F4A',
    text: '#E0F7FA', text2: '#9CA3AF', text3: '#6B7280', isDark: true,
  },
  'dark-purple': {
    name: 'Midnight Purple', color: 'linear-gradient(135deg, #2E1065 50%, #8B5CF6 100%)',
    pri: '#8B5CF6', priDark: '#7C3AED', priDeep: '#5B21B6', priLight: '#2E1065', priMid: '#4C1D95',
    bg: '#170A2C', surface: '#241244', surface2: '#2E1065', border: '#4C1D95',
    text: '#F5F3FF', text2: '#DDD6FE', text3: '#C4B5FD', isDark: true,
  },
};

const ThemeContext = createContext(null);

function applyThemeToDOM(theme) {
  const r = document.documentElement.style;
  r.setProperty('--t-pri', theme.pri);
  r.setProperty('--t-pri-dark', theme.priDark);
  r.setProperty('--t-pri-deep', theme.priDeep);
  r.setProperty('--t-pri-light', theme.priLight);
  r.setProperty('--t-pri-mid', theme.priMid);
  r.setProperty('--t-bg', theme.bg);
  r.setProperty('--t-surface', theme.surface);
  r.setProperty('--t-surface-2', theme.surface2);
  r.setProperty('--t-border', theme.border);
  r.setProperty('--t-text', theme.text);
  r.setProperty('--t-text-2', theme.text2);
  r.setProperty('--t-text-3', theme.text3);
  document.body.style.backgroundColor = theme.bg;
  document.body.style.color = theme.text;
}

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('site_theme') || 'blue');

  const theme = THEMES[themeName] || THEMES.blue;

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [themeName]);

  const changeTheme = useCallback((name) => {
    setThemeName(name);
    localStorage.setItem('site_theme', name);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeName, changeTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
