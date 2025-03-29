import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(),tailwindcss()],
  // server: { 
  //   // proxy: {
  //   //   '/api': {
  //   //     target: 'http://localhost:5000',
  //   //     changeOrigin: true,
  //   //     rewrite: (path) => path.replace(/^\/api/, '/api')
  //   //   }
  //   // }
  // },
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
