import configBase from './vite.config';
import { defineConfig } from 'vitest/config';

// vite.config.js
const srcs = ['utils', 'model', 'dom', '3d', '2d', 'mixins'];

export default defineConfig({
  ...configBase,
  publicDir: false,
  test: {
    include: srcs.map((s) => `**/${s}/**/*.test.{ts,js}`),
  },
});
