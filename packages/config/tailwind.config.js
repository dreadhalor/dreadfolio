import config from './quick-tailwind.config.js';
config.content.push(
  '../../packages/dread-ui/**/*.{js,ts,jsx,tsx}', // Add the dread-ui package
  '../../../packages/dread-ui/**/*.{js,ts,jsx,tsx}', // Add the dread-ui package for nested frontend/backend apps
);
export default config;
