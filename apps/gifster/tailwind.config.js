import baseConfig from '@repo/config/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/dread-ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};
