import type { APIRoute } from 'astro';
import { SITE } from '@shared/config/site';

export const GET: APIRoute = () => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${new URL('/sitemap.xml', SITE.url).href}`].join(
    '\n',
  );
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
