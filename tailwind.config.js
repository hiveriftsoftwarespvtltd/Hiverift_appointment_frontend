/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF3FF',
          100: '#D5E7FF',
          200: '#BFD8FF',
          300: '#93BEFF',
          400: '#5C9EFF',
          500: '#2578FB',
          600: '#1257C7',
          700: '#0D47A1',
          800: '#0A3780',
          900: '#072659',
          DEFAULT: '#2578FB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        blue: '0 6px 20px rgba(37, 120, 251, 0.25)',
        card: '0 4px 20px rgba(0, 0, 0, 0.04)',
        subtle: '0 8px 24px rgba(17, 24, 39, 0.05)',
        outer: '0 8px 30px rgba(17, 24, 39, 0.06)',
        floating: '0 12px 36px rgba(37, 120, 251, 0.12)',
      },
    },
  },
  plugins: [],
};
