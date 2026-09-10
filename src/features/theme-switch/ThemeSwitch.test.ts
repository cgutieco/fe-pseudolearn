import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import ThemeSwitch from './ThemeSwitch.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('ThemeSwitch', () => {
  it('renders default field variant with accessibility attributes', async () => {
    const html = await container.renderToString(ThemeSwitch, {
      props: { locale: 'es' },
    });
    expect(html).toContain('class="theme-switch theme-switch--field"');
    expect(html).toContain('role="group"');
    expect(html).toContain('data-theme-choice="light"');
    expect(html).toContain('data-theme-choice="dark"');
  });

  it('renders surface variant when specified', async () => {
    const html = await container.renderToString(ThemeSwitch, {
      props: { locale: 'es', variant: 'surface' },
    });
    expect(html).toContain('class="theme-switch theme-switch--surface"');
  });

  it('renders compact modifier when specified', async () => {
    const html = await container.renderToString(ThemeSwitch, {
      props: { locale: 'en', compact: true },
    });
    expect(html).toContain('theme-switch--compact');
  });
});
