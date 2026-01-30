import config from '@repo/config/quick-tailwind.config.js';

// Add only dread-ui/src (not Storybook, examples, etc.)
config.content.push('../../../packages/dread-ui/src/**/*.{ts,tsx}');

export default config;
