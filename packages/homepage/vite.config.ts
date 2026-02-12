import { type PluginOption, defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react() as PluginOption,
    tailwindcss(),
  ],
  server: {
    port: 5177,
  },
});
