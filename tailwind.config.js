/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        category: {
          learning: '#3b82f6',
          work: '#a855f7',
          health: '#22c55e',
          personal: '#ec4899',
          info: '#f59e0b',
          creative: '#06b6d4',
        },
      },
    },
  },
  plugins: [],
}
