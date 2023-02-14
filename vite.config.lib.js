import path from 'path';
import configBase from './vite.config';
import tsConfig from './tsconfig.lib.json';

// vite.config.js
/** @type {import('vite').UserConfig} */
export default {
  ...configBase,
  publicDir: false,
  root: './src',
  build: {
    ...configBase.build,
    rollupOptions: {
      output: {
        exports: 'named',
      },
      external: ['react', 'react-dom', 'leaflet', 'three'],
    },
    minify: true,
    sourcemap: 'inline',
    lib: {
      name: 'wik',
      entry: './index.ts',
      formats: ['cjs'],
      fileName: 'index',
    },
    outDir: path.resolve('./', tsConfig.compilerOptions.outDir),
    emptyOutDir: false,
  },
};
