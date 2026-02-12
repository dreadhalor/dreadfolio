import baseConfig from '@repo/config/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/dread-ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      animation: {
        ...baseConfig.theme.extend.animation,
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        ...baseConfig.theme.extend.keyframes,
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
      },
    },
  },
};
