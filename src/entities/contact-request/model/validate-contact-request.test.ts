import { describe, expect, it } from 'vitest';
import { SITE } from '@shared/config/site';
import { validateContactRequest } from './validate-contact-request';

const validInput = {
  reason: 'question',
  email: 'ana@ejemplo.com',
  message: 'No entiendo el aliasing del módulo C3.',
  acceptPrivacy: 'on',
  locale: 'es',
};

describe('validateContactRequest', () => {
  it('accepts a minimal valid submission', () => {
    const result = validateContactRequest(validInput);
    expect(result.kind).toBe('valid');
  });

  it('normalises whitespace and optional fields', () => {
    const result = validateContactRequest({ ...validInput, name: '  Ana  ', friction: '   ' });
    expect(result.kind === 'valid' && result.request.name).toBe('Ana');
    expect(result.kind === 'valid' && result.request.friction).toBeUndefined();
  });

  it('rejects an empty submission with one code per missing field', () => {
    const result = validateContactRequest({});
    expect(result.kind).toBe('invalid');
    expect(result.kind === 'invalid' && result.fields).toEqual({
      reason: 'required',
      email: 'required',
      message: 'required',
      acceptPrivacy: 'required',
    });
  });

  it('rejects a malformed address', () => {
    const result = validateContactRequest({ ...validInput, email: 'ana@' });
    expect(result.kind === 'invalid' && result.fields.email).toBe('invalid');
  });

  it('rejects an unknown reason', () => {
    const result = validateContactRequest({ ...validInput, reason: 'complaint' });
    expect(result.kind === 'invalid' && result.fields.reason).toBe('unknown_option');
  });

  it('rejects a message past the limit', () => {
    const result = validateContactRequest({ ...validInput, message: 'a'.repeat(SITE.messageMaxLength + 1) });
    expect(result.kind === 'invalid' && result.fields.message).toBe('too_long');
  });

  it('accepts a message exactly at the limit', () => {
    const result = validateContactRequest({ ...validInput, message: 'a'.repeat(SITE.messageMaxLength) });
    expect(result.kind).toBe('valid');
  });

  it('requires the intent when the reason is a feature request', () => {
    const result = validateContactRequest({ ...validInput, reason: 'feature' });
    expect(result.kind === 'invalid' && result.fields.featureIntent).toBe('required');
  });

  it('rejects an unknown platform but tolerates an empty one', () => {
    expect(validateContactRequest({ ...validInput, platform: 'beos' }).kind).toBe('invalid');
    expect(validateContactRequest({ ...validInput, platform: '' }).kind).toBe('valid');
  });

  it('defaults an unknown locale to spanish', () => {
    const result = validateContactRequest({ ...validInput, locale: 'fr' });
    expect(result.kind === 'valid' && result.request.locale).toBe('es');
  });

  it('reads the environment checkbox as a boolean', () => {
    const result = validateContactRequest({ ...validInput, includeEnvironment: 'on' });
    expect(result.kind === 'valid' && result.request.includeEnvironment).toBe(true);
  });
});
