import { defineConfig, PluginOption } from 'vite'; // Import the PluginOption type
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react() as PluginOption,
    tsconfigPaths() as PluginOption,
    svgr() as PluginOption,
  ], // Cast the plugins to PluginOption
  base: '/su-done-ku/', // Set the base path
});
