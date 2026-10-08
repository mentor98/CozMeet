/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1D7FF7',
        'light-blue': '#E3F0FF',
        'dark-text': '#1a1a1a',
        'secondary-text': '#646464',
        'light-gray': '#f5f5f5',
        'border-gray': '#e0e0e0',
      },
      spacing: {
        'sidebar-width': '280px',
        'feed-width': '600px',
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
