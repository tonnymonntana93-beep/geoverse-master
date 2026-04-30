/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        'geo-bg': '#050505',
        'geo-panel': '#111',
        'geo-cyan': '#00f3ff',
        'geo-purple': '#b535f6',
      }
    },
  },
  plugins: [],
}
