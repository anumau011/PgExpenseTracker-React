import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    // host: '0.0.0.0', // Allow access from any IP address
    port: 5173,          
  },
  plugins: [react(), tailwindcss()]
})
