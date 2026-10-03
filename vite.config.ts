import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function atelierStaticPlugin(): Plugin {
  return {
    name: 'atelier-static-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        
        // Handle .jfif images with proper image/jpeg MIME type
        if (url.endsWith('.jfif')) {
          const filePath = path.resolve(__dirname, 'public' + url);
          const altPath = path.resolve(__dirname, '.' + url);
          const target = fs.existsSync(filePath) ? filePath : (fs.existsSync(altPath) ? altPath : null);
          if (target) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            fs.createReadStream(target).pipe(res);
            return;
          }
        }

        // Handle multi-page HTML routes
        const htmlPages = [
          '/evening-dresses.html',
          '/wedding-bridal.html',
          '/accessories.html',
          '/exclusive-collection.html',
        ];
        if (htmlPages.includes(url)) {
          const htmlPath = path.resolve(__dirname, '.' + url);
          if (fs.existsSync(htmlPath)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(fs.readFileSync(htmlPath, 'utf-8'));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [atelierStaticPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          evening: path.resolve(__dirname, 'evening-dresses.html'),
          wedding: path.resolve(__dirname, 'wedding-bridal.html'),
          accessories: path.resolve(__dirname, 'accessories.html'),
          exclusive: path.resolve(__dirname, 'exclusive-collection.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

