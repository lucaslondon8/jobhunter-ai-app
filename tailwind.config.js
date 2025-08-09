/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'electric-blue': '#00BFFF',
        'pearl': '#F0F8FF',
      },
    },
  },
  plugins: [],
};
