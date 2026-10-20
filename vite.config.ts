import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// bind all interfaces so the Arena preview proxy can reach the dev server
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    hmr: { clientPort: 443 },
  },
  preview: { host: '0.0.0.0', allowedHosts: true },
});
