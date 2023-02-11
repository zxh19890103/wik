import configBase from './vite.config';
import tsConfig from './tsconfig.prod.json';
import path from 'path';

// vite.config.js
/** @type {import('vite').UserConfig} */
export default {
  ...configBase,
  publicDir: false,
  root: './src',
  build: {
    ...configBase.build,
    minify: false,
    lib: {
      name: 'wik',
      entry: './index.ts',
      formats: ['umd'],
      fileName: 'index',
    },
    outDir: path.resolve('./', tsConfig.compilerOptions.outDir),
    emptyOutDir: false,
  },
};
