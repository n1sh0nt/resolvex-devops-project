/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#eef2f7',
          100: '#d7e0ec',
          200: '#aec1d9',
          300: '#84a2c6',
          400: '#5a83b3',
          500: '#3b6699',
          600: '#294c78',
          700: '#1c3557',
          800: '#122340',
          900: '#0b1626',
        },
        brass: {
          50: '#faf5e8',
          100: '#f2e3bd',
          200: '#e6cd8c',
          300: '#d9b65c',
          400: '#c89b3c',
          500: '#ab7f2b',
          600: '#8a6521',
          700: '#684c19',
          800: '#473311',
          900: '#271b09',
        },
        paper: '#f7f5f0',
        surface: '#ffffff',
        status: {
          pending: '#d97706',
          assigned: '#2563eb',
          progress: '#7c3aed',
          resolved: '#059669',
          closed: '#64748b',
          rejected: '#dc2626',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 22, 38, 0.06), 0 4px 16px rgba(11, 22, 38, 0.06)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
