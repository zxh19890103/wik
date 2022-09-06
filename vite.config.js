import { viteExternalsPlugin } from 'vite-plugin-externals';

// vite.config.js
/** @type {import('vite').UserConfig} */
export default {
  root: './',
  publicDir: './demo/public',
  define: {
    __PROD__: process.env.NODE_ENV === 'production',
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom', 'leaflet', 'three'],
  },
  server: {
    port: 3005,
    open: true,
  },
  /**
   * We do not use vite's build feature, instead we use TSC to transform TS file to "es6 + d.ts"
   */
  build: {
    lib: {
      name: 'hrGUI',
      entry: './lib.ts',
      formats: ['es', 'umd'],
      fileName: 'hrgui',
    },
  },
  plugins: [
    viteExternalsPlugin({
      react: 'React',
      'react-dom': 'ReactDOM',
      leaflet: 'L',
      three: 'Three',
    }),
  ],
};
