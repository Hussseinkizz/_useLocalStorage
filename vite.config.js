import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'useLocalStorage.js',
      name: 'useLocalStorage',
      fileName: 'useLocalStorage',
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: false,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
      output: {
        beautify: false,
        comments: 'some',
        preserve_annotations: true,
        semicolons: true,
      },
    },
  },
});
