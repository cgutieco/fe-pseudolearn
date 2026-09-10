import { describe, expect, it } from 'vitest';
import { renderRichText } from './render-rich-text';

describe('renderRichText', () => {
  it('keeps the allowed inline tags', () => {
    expect(renderRichText('un <code>FinMientras</code> de más')).toBe('un <code>FinMientras</code> de más');
  });

  it('escapes every other tag', () => {
    expect(renderRichText('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes attributes hidden inside an allowed tag name', () => {
    expect(renderRichText('<code onclick="x">a</code>')).toBe('&lt;code onclick=&quot;x&quot;&gt;a</code>');
  });

  it('returns an empty string unchanged', () => {
    expect(renderRichText('')).toBe('');
  });

  it('escapes a bare ampersand', () => {
    expect(renderRichText('tipos & valores')).toBe('tipos &amp; valores');
  });
});
