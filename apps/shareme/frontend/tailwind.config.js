import config from '@repo/config/tailwind.config';
// export default config;
// const { theme } = config;
const colors = config.theme.extend.colors;
config.theme.extend.colors = {
  ...colors,
  empty: 'rgb(245,245,245)',
};
const keyframes = config.theme.extend.keyframes;
config.theme.extend.keyframes = {
  ...keyframes,
  'slide-in': {
    '0%': {
      '-webkit-transform': 'translateX(-200px)',
      transform: 'translateX(-200px)',
    },
    '100%': {
      '-webkit-transform': 'translateX(0px)',
      transform: 'translateX(0px)',
    },
  },
  'slide-fwd': {
    '0%': {
      '-webkit-transform': 'translateZ(0px)',
      transform: 'translateZ(0px)',
    },
    '100%': {
      '-webkit-transform': 'translateZ(160px)',
      transform: 'translateZ(160px)',
    },
  },
};
const animation = config.theme.extend.animation;
config.theme.extend.animation = {
  ...animation,
  'slide-in': 'slide-in 0.5s ease-out',
  'slide-fwd': ' slide-fwd 0.45s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
};
export default config;
