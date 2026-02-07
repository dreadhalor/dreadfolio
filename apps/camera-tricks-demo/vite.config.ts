import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    https: (() => {
      // Check if HTTPS is explicitly disabled via env var
      if (process.env.USE_HTTPS === 'false') {
        console.log('HTTPS disabled via USE_HTTPS=false');
        return false;
      }
      
      // Check if certificates exist
      const certPath = path.resolve(__dirname, '../../localhost+2.pem');
      const keyPath = path.resolve(__dirname, '../../localhost+2-key.pem');
      const certsExist = fs.existsSync(certPath) && fs.existsSync(keyPath);
      
      if (!certsExist) {
        console.log('HTTPS certificates not found, using HTTP');
        return false;
      }
      
      // Use HTTPS by default if certs exist (unless explicitly disabled)
      console.log('Using HTTPS with mkcert certificates');
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    })(),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@react-three/fiber', '@react-three/drei', 'three'],
    exclude: [],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
});
