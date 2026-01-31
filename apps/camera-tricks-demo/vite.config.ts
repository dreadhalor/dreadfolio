import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei', 'three'],
    exclude: [],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
