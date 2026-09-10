import { describe, expect, it } from 'vitest';
import type { ContactRequest } from '../model/contact-request';
import { buildContactSubject, formatContactMessageBody } from './format-contact-message';

const base: ContactRequest = {
  reason: 'error',
  email: 'ana@ejemplo.com',
  name: 'Ana',
  message: 'Se cierra al ejecutar.',
  locale: 'es',
  includeEnvironment: false,
};

describe('formatContactMessageBody', () => {
  it('omits fields that were not filled in', () => {
    const body = formatContactMessageBody(base, null);
    expect(body).not.toContain('Platform:');
    expect(body).toContain('Email: ana@ejemplo.com');
  });

  it('includes the user agent only when consent was given', () => {
    expect(formatContactMessageBody(base, 'Firefox')).not.toContain('Firefox');
    expect(formatContactMessageBody({ ...base, includeEnvironment: true }, 'Firefox')).toContain('Firefox');
  });

  it('appends the program in its own section when present', () => {
    const body = formatContactMessageBody({ ...base, codeSnippet: 'Escribir 1;' }, null);
    expect(body).toContain('--- Program ---');
    expect(body).toContain('Escribir 1;');
  });
});

describe('buildContactSubject', () => {
  it('uses the name when there is one', () => {
    expect(buildContactSubject(base)).toBe('[PseudoLearn/es] error - Ana');
  });

  it('falls back to the address when the name is empty', () => {
    expect(buildContactSubject({ ...base, name: '' })).toBe('[PseudoLearn/es] error - ana@ejemplo.com');
  });
});
