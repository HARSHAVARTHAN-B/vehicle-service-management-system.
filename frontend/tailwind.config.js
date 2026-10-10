/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563EB',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        secondary: {
          500: '#06B6D4',
          600: '#0891b2',
        },
        accent: {
          500: '#F97316',
          600: '#ea580c',
        },
        success: {
          500: '#22C55E',
          600: '#16a34a',
        },
        danger: {
          500: '#EF4444',
          600: '#dc2626',
        },
        surface: {
          50: '#F8FAFC',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
