import configBase from './vite.config';
import tsConfig from './tsconfig.prod.json';

// vite.config.js
/** @type {import('vite').UserConfig} */
export default {
  ...configBase,
  publicDir: false,
  build: {
    ...configBase.build,
    lib: {
      name: 'wik',
      entry: './index.ts',
      formats: ['es', 'umd'],
      fileName: 'index',
    },
    outDir: tsConfig.compilerOptions.outDir,
    emptyOutDir: false,
  },
};
