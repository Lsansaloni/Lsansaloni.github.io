import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// GitHub Pages project site: repo "llucky-games" served at
// https://<username>.github.io/llucky-games/
// If you rename the repo or buy a custom domain, update site + base here.
export default defineConfig({
  site: 'https://lluckygames.github.io',
  base: '/llucky-games',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark',
    },
  },
});
