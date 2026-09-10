import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import SelectField from './SelectField.astro';

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('SelectField', () => {
  it('renders native select alongside custom trigger and floating menu', async () => {
    const html = await container.renderToString(SelectField, {
      props: { id: 'test-select', name: 'category', label: 'Choose a category' },
      slots: {
        default: '<option value="a">Alpha</option><option value="b">Beta</option>',
      },
    });

    expect(html).toContain('id="test-select"');
    expect(html).toContain('name="category"');
    expect(html).toContain('aria-label="Choose a category"');
    expect(html).toContain('class="pl-form-control pl-select__trigger"');
    expect(html).toContain('aria-controls="test-select-menu"');
    expect(html).toContain('class="pl-select__menu"');
    expect(html).toContain('role="listbox"');
  });

  it('sets initial trigger text from first option and builds custom options', async () => {
    const html = await container.renderToString(SelectField, {
      props: { id: 'lang-select', name: 'lang' },
      slots: {
        default: '<option value="es" selected>Español</option><option value="en">English</option>',
      },
    });

    expect(html).toContain('<span class="pl-select__trigger-text">Español</span>');
    expect(html).toContain('data-value="es"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('data-value="en"');
  });

  it('transforms optgroup elements into accessible groups', async () => {
    const html = await container.renderToString(SelectField, {
      props: { id: 'grouped-select', name: 'item' },
      slots: {
        default: '<optgroup label="Fruits"><option value="apple">Apple</option></optgroup>',
      },
    });

    expect(html).toContain('class="pl-select__group"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Fruits"');
    expect(html).toContain('class="pl-select__group-label"');
    expect(html).toContain('Apple');
  });
});
