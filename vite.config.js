import path from 'path';

// vite.config.js
/** @type {import('vite').UserConfig} */
export default {
  root: '.',
  define: {
    __PROD__: process.env.NODE_ENV === 'production',
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom', 'leaflet', 'three'],
  },
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  /**
   * We do not use vite's build feature, instead we use TSC to transform TS file to "es6 + d.ts"
   * Now we use vite to build.
   */
  build: {},
  plugins: [],
};
