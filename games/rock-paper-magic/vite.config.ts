import { defineConfig } from 'vite';

// Build straight into the site's public folder so `npm run build` here
// updates the embeddable copy the portfolio serves. Relative base so the
// game works under any path in an iframe.
export default defineConfig({
  base: './',
  build: {
    outDir: '../../site/public/games/rock-paper-magic',
    emptyOutDir: true,
  },
});
