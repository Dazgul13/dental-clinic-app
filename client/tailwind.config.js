/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PearlDesk primary — Dental Teal (remapped from blue)
        // All bg-primary-* classes across the app will now render teal
        primary: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6de',
          300: '#5eead0',
          400: '#2dd4b8',
          500: '#14b89f',
          600: '#2A9D8F',  // --primary
          700: '#1B7A6E',  // --primary-dark
          800: '#146055',
          900: '#104a41',
        },
        // Navy — slate dark (unchanged, used for sidebar + headings)
        navy: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Teal alias — kept for backward compat with existing teal-* classes
        teal: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6de',
          300: '#5eead0',
          400: '#2dd4b8',
          500: '#14b89f',
          600: '#2A9D8F',
          700: '#1B7A6E',
          800: '#146055',
          900: '#104a41',
        },
        // Accent — Warm Coral
        accent: {
          DEFAULT: '#E76F51',
          light:   '#F4A082',
          dark:    '#d4613e',
        },
      },
      fontFamily: {
        sans:   ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif:  ['Lora', 'Georgia', 'serif'],
        mono:   ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card':       '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.10)',
        'modal':      '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
