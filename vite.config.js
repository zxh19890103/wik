import { viteExternalsPlugin } from 'vite-plugin-externals';
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
  plugins: [
    viteExternalsPlugin(
      {
        react: '__wik__.React',
        'react-dom': '__wik__.ReactDOM',
        leaflet: '__wik__.L',
        three: '__wik__.THREE',
      },
      {
        useWindow: false,
      },
    ),
  ],
};
