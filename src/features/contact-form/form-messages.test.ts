import { describe, expect, it } from 'vitest';
import { emailMessage, messageForOutcome, renderCounter, type ClientMessages } from './form-messages';

const messages = {
  counter: '{used} / {total}',
  emailRequired: 'requerido',
  emailInvalid: 'invalido',
  emailMissingAt: 'sin arroba',
  emailMissingDomain: 'sin dominio',
  sending: 'enviando',
  success: 'enviado',
  badRequest: 'peticion mala',
  captchaFailed: 'captcha',
  validationError: 'validacion',
  mailFailed: 'correo',
  rateLimited: 'limite',
  networkError: 'red',
} satisfies ClientMessages;

describe('messageForOutcome', () => {
  it('maps every known status', () => {
    expect(messageForOutcome(messages, 'ok')).toBe('enviado');
    expect(messageForOutcome(messages, 'captcha_failed')).toBe('captcha');
    expect(messageForOutcome(messages, 'rate_limited')).toBe('limite');
  });

  it('falls back to the network message on an unknown status', () => {
    expect(messageForOutcome(messages, 'teapot')).toBe('red');
  });
});

describe('emailMessage', () => {
  it('distinguishes empty, missing at sign and missing domain', () => {
    expect(emailMessage(messages, '   ')).toBe('requerido');
    expect(emailMessage(messages, 'ana')).toBe('sin arroba');
    expect(emailMessage(messages, 'ana@')).toBe('sin dominio');
    expect(emailMessage(messages, 'ana@x')).toBe('invalido');
  });
});

describe('renderCounter', () => {
  it('substitutes both placeholders', () => {
    expect(renderCounter('{used} / {total}', 12, 2000)).toBe('12 / 2000');
  });

  it('handles a zero count', () => {
    expect(renderCounter('{used} / {total}', 0, 2000)).toBe('0 / 2000');
  });
});
