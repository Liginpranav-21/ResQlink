import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@resqlink/shared': path.resolve(__dirname, '../shared'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'firebase': path.resolve(__dirname, './node_modules/firebase'),
      'firebase/app': path.resolve(__dirname, './node_modules/firebase/app'),
      'firebase/auth': path.resolve(__dirname, './node_modules/firebase/auth'),
      'firebase/database': path.resolve(__dirname, './node_modules/firebase/database'),
      'firebase/storage': path.resolve(__dirname, './node_modules/firebase/storage'),
    },
  },
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/storage'],
          charts: ['recharts']
        }
      }
    }
  }
});
