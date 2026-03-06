import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  // Custom domain: https://onefine.lk
  base: '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://13.60.254.1:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://13.60.254.1:4000',
        changeOrigin: true,
      },
    },
  },
});
