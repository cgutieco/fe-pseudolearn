import { getViteConfig } from 'astro/config';

type AstroViteConfig = Parameters<typeof getViteConfig>[0];

const configuration = {
  resolve: {
    alias: {
      'cloudflare:sockets': new URL('./src/shared/testing/cloudflare-sockets-stub.ts', import.meta.url)
        .pathname,
      'cloudflare:workers': new URL('./src/shared/testing/cloudflare-workers-stub.ts', import.meta.url)
        .pathname,
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
    globals: false,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/testing/**'],
    },
  },
};

export default getViteConfig(configuration as AstroViteConfig);
