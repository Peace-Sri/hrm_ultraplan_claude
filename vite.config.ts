import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'charts'
          if (id.includes('node_modules/xlsx')) return 'xlsx'
          if (id.includes('jspdf')) return 'pdf'
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
