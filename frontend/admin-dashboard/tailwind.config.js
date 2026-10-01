/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      // Same brand palette as the portfolio (frontend/product-website) —
      // this dashboard is meant to feel like the same product, not a
      // separately-branded tool bolted on.
      colors: {
        brand: {
          navy: '#0B1220',
          surface: '#111827',
          card: '#1F2937',
          border: '#334155',
          red: '#FF3B30',
          blue: '#2563EB',
          green: '#10B981',
          yellow: '#F59E0B',
          textPrimary: '#F8FAFC',
          textSecondary: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
