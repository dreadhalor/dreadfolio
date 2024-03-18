import config from '@repo/config/quick-tailwind.config.js';
config.corePlugins = {
  ...config.corePlugins,
  preflight: false,
};
export default config;
