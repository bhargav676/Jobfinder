import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(),tailwindcss()],
  theme: { 
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  colors: {
    charcoal: 'var(--charcoal)',
    emerald: 'var(--emerald)',
    'emerald-dark': 'var(--emerald-dark)',
    'emerald-light': 'var(--emerald-light)',
    slate: 'var(--slate)',
  },
})
