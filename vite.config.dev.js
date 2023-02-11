import configBase from './vite.config';

// vite.config.js
/** @type {import('vite').UserConfig} */
export default {
  ...configBase,
  publicDir: './demo/public',
  server: {
    port: 3005,
    open: true,
  },
  build: {},
};
