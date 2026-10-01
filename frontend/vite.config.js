import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change this to the address your Python backend runs on.
const BACKEND = 'http://127.0.0.1:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': BACKEND },
  },
})
