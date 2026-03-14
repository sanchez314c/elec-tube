/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'neo': {
          'void': '#0a0b0e',
          'surface': '#111214',
          'card': '#141518',
          'card-hover': '#1a1b1f',
          'sidebar': '#0d0e10',
          'input': '#18191c',
          'teal': '#14b8a6',
          'teal-hover': '#0d9488',
          'teal-dim': 'rgba(20,184,166,0.12)',
          'blue': '#06b6d4',
          'purple': '#8b5cf6',
          'text': '#e8e8ec',
          'text-secondary': '#9a9aa6',
          'text-muted': '#5c5c6a',
          'text-dim': '#44444e',
          'text-heading': '#f4f4f7',
          'border-subtle': '#1e1e24',
          'border-light': '#2a2a30',
        },
      },
      gridTemplateColumns: {
        'thumbnails': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    },
  },
  plugins: [],
}
