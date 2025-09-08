import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://todo-list.dcism.org',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'https://todo-list.dcism.org',
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // If body is present and content-type is missing, set to urlencoded
            const hasContentType = proxyReq.getHeader('content-type');
            if (!hasContentType) {
              proxyReq.setHeader('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }
          });
        },
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
