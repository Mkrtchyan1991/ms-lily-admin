import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // important for correct routing on deploy
  plugins: [react({ babel: { plugins: [['babel-plugin-react-compiler', { target: '19' }]] } })],
  resolve: {
    alias: { '@': '/src' },
  },
  css: {
    modules: {
      localsConvention: 'dashes',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables.scss" as *;
          @use "@/styles/mixins.scss" as *;
        `,
      },
    },
  },
});
