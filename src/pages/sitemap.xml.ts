import type { APIRoute } from 'astro';
import { SITE } from '@shared/config/site';
import { LOCALES } from '@shared/i18n/locales';
import { ROUTES, localizePath } from '@shared/i18n/routes';

const CHANGE_FREQUENCY = 'monthly';

export const GET: APIRoute = () => {
  const entries = Object.values(ROUTES).flatMap((route) =>
    LOCALES.map((locale) => ({ locale, route, url: new URL(localizePath(route, locale), SITE.url).href })),
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((entry) => renderUrl(entry.url, entry.route)).join('\n')}
</urlset>`;

  return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};

function renderUrl(url: string, route: string): string {
  const alternates = LOCALES.map(
    (locale) =>
      `    <xhtml:link rel="alternate" hreflang="${locale}" href="${new URL(localizePath(route, locale), SITE.url).href}"/>`,
  ).join('\n');
  return `  <url>\n    <loc>${url}</loc>\n    <changefreq>${CHANGE_FREQUENCY}</changefreq>\n${alternates}\n  </url>`;
}
