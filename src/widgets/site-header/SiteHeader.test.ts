import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import SiteHeader from './SiteHeader.astro';
import SiteFooter from '@widgets/site-footer/SiteFooter.astro';
import PageHero from '@widgets/page-hero/PageHero.astro';
import { ROUTES } from '@shared/i18n/routes';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('SiteHeader', () => {
  it('renders spanish navigation at the unprefixed root', async () => {
    const html = await container.renderToString(SiteHeader, { props: { locale: 'es', path: ROUTES.home } });
    expect(html).toContain('Ruta de aprendizaje');
    expect(html).toContain('href="/contact"');
    expect(html).not.toContain('Learning path');
  });

  it('renders english navigation under the locale prefix', async () => {
    const html = await container.renderToString(SiteHeader, { props: { locale: 'en', path: ROUTES.home } });
    expect(html).toContain('Learning path');
    expect(html).toContain('href="/en/contact"');
  });

  it('marks the active route for assistive technology', async () => {
    const html = await container.renderToString(SiteHeader, {
      props: { locale: 'es', path: ROUTES.contact },
    });
    expect(html).toContain('aria-current="page"');
  });

  it('offers both languages pointing at the same page', async () => {
    const html = await container.renderToString(SiteHeader, {
      props: { locale: 'es', path: ROUTES.versions },
    });
    expect(html).toContain('href="/versions"');
    expect(html).toContain('href="/en/versions"');
  });

  it('renders both desktop navigation and mobile menu details', async () => {
    const html = await container.renderToString(SiteHeader, {
      props: { locale: 'es', path: ROUTES.home },
    });
    expect(html).toContain('class="site-header__nav"');
    expect(html).toContain('class="mobile-menu"');
    expect(html).toContain('class="site-header__actions"');
  });

  it('provides compact codes and full labels in the language switch', async () => {
    const html = await container.renderToString(SiteHeader, {
      props: { locale: 'es', path: ROUTES.home },
    });
    expect(html).toContain('class="language-switch__label"');
    expect(html).toContain('class="language-switch__code"');
    expect(html).toContain('>Español<');
    expect(html).toContain('>ES<');
  });
});

describe('SiteFooter', () => {
  it('exposes the support address and the author link', async () => {
    const html = await container.renderToString(SiteFooter, { props: { locale: 'es', path: ROUTES.home } });
    expect(html).toContain('mailto:support@pseudolearn.com');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('never mentions the old domain', async () => {
    const html = await container.renderToString(SiteFooter, { props: { locale: 'en', path: ROUTES.home } });
    expect(html).not.toContain('pseudolearn.dev');
  });
});

describe('PageHero', () => {
  it('renders exactly one first level heading', async () => {
    const html = await container.renderToString(PageHero, {
      props: { overline: 'Contacto', title: 'Un título', lead: 'Una entrada.' },
    });
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it('escapes markup coming from its props', async () => {
    const html = await container.renderToString(PageHero, {
      props: { overline: 'x', title: '<img onerror=alert(1)>', lead: 'y' },
    });
    expect(html).not.toContain('<img onerror');
  });
});
