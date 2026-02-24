import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  // App is hosted at https://venujageenodh.github.io/Onefine.lk/
  base: '/Onefine.lk/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
