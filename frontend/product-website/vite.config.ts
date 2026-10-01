import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-mobile-html',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/mobile' || req.url === '/mobile/ResQLink-Mobile.html') {
            const filePath = path.resolve(__dirname, '../mobile-app/ResQLink-Mobile.html');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/html');
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@resqlink/shared': path.resolve(__dirname, '../shared'),
      // Admin dashboard is mounted in-app at /admin/* (see src/App.tsx) rather
      // than deployed as a separate static build. Aliasing straight to its
      // src folder means it compiles as part of THIS bundle, so the 'react'
      // aliases below force it onto the same single React instance as the
      // rest of the site (avoids the "invalid hook call" duplicate-React bug
      // that nested SPAs normally hit).
      '@resqlink/admin-dashboard': path.resolve(__dirname, '../admin-dashboard/src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
      'firebase': path.resolve(__dirname, './node_modules/firebase'),
      'firebase/app': path.resolve(__dirname, './node_modules/firebase/app'),
      'firebase/auth': path.resolve(__dirname, './node_modules/firebase/auth'),
      'firebase/database': path.resolve(__dirname, './node_modules/firebase/database'),
      'firebase/storage': path.resolve(__dirname, './node_modules/firebase/storage'),
    }
  }
})
