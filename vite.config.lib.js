import path from 'path';
import configBase from './vite.config';
import tsConfig from './tsconfig.lib.json';
import bannerGen from './scripts/banner';

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
        chunkFileNames: '_shared.js',
        banner: bannerGen(),
      },
      external: ['react', 'react-dom', 'leaflet', 'three'],
    },
    minify: true,
    sourcemap: true,
    lib: {
      name: 'wik',
      entry: ['./i2d.ts', './i3d.ts'],
      formats: ['cjs'],
      fileName: '[name]',
    },
    outDir: path.resolve('./', tsConfig.compilerOptions.outDir),
    emptyOutDir: false,
  },
};
