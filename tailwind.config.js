/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          PRIMARY: '#C89B3C',
          DARK: '#A87C20',
          LIGHT: '#E6C875',
          SOFT: '#FBF6E8',
          TINT: '#F7EFD8',
          BORDER: '#D9B65A',
        },
        charcoal: {
          DEFAULT: '#171717',
          DEEP: '#111111',
          SECONDARY: '#5F5F5F',
          MUTED: '#8A8A8A',
        },
        ivory: {
          DEFAULT: '#FFFDF8',
          CARD: '#FFFFFF',
          BORDER: '#E8E2D6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 6px 18px rgba(200, 155, 60, 0.22)',
        subtle: '0 8px 24px rgba(20, 15, 5, 0.05)',
        outer: '0 8px 30px rgba(35, 27, 10, 0.06)',
      },
    },
  },
  plugins: [],
};
