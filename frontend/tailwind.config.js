/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b14',
          900: '#0c1222',
          800: '#131e38',
          700: '#1e2e54',
          600: '#2b3f73',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        forensic: {
          dark: '#090d16',
          panel: '#0f172a',
          card: '#131c31',
          border: '#1e293b',
          accent: '#00f2fe',
          blue: '#3b82f6',
          warning: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'glow-blue': '0 0 15px -3px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
}
