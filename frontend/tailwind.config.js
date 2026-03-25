/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pri: {
          DEFAULT: 'var(--t-pri)',
          dark: 'var(--t-pri-dark)',
          deep: 'var(--t-pri-deep)',
          light: 'var(--t-pri-light)',
          mid: 'var(--t-pri-mid)',
        },
        acc: {
          DEFAULT: '#F5A623',
          green: '#0DA678',
          red: '#E53935',
        },
        ink: {
          DEFAULT: 'var(--t-text)',
          2: 'var(--t-text-2)',
          3: 'var(--t-text-3)',
        },
        bg: 'var(--t-bg)',
        surface: 'var(--t-surface)',
        'surface-2': 'var(--t-surface-2)',
        border: 'var(--t-border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
