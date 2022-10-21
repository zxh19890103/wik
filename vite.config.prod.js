import configBase from './vite.config';
import tsConfig from './tsconfig.prod.json';

// vite.config.js
/** @type {import('vite').UserConfig} */
export default {
  ...configBase,
  publicDir: false,
  build: {
    ...configBase.build,
    outDir: tsConfig.compilerOptions.outDir,
    emptyOutDir: false,
  },
};
