import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

const isUnitTestRun = process.env.VITEST === 'true';

export default defineConfig({
  site: 'https://pseudolearn.app',
  output: 'static',
  ...(isUnitTestRun ? {} : { adapter: cloudflare({ imageService: 'compile' }) }),
  trailingSlash: 'never',
  build: { inlineStylesheets: 'auto', format: 'file' },
  prefetch: { prefetchAll: false },
  redirects: {
    '/contacto': '/contact',
    '/versiones': '/versions',
    '/privacidad': '/privacy',
    '/terminos': '/terms',
    '/legal': '/terms',
  },
});
