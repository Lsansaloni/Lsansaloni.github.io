import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// User site: repo "Lsansaloni.github.io" served at https://lsansaloni.github.io/
// If you later buy a custom domain, set site: 'https://llucky.games' and base: '/'.
export default defineConfig({
  site: 'https://lsansaloni.github.io',
  base: '/',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'vitesse-dark',
    },
  },
});
