import { describe, expect, it } from 'vitest';
import {
  buildMimeMessage,
  encodeCredentials,
  encodeHeaderValue,
  expectStatus,
  isCompleteResponse,
  SmtpError,
} from './smtp-protocol';

const message = {
  from: 'no-reply@pseudolearn.app',
  to: 'support@pseudolearn.com',
  replyTo: 'ana@ejemplo.com',
  subject: 'Una duda',
  body: 'Primera línea\nSegunda línea',
};

describe('encodeHeaderValue', () => {
  it('leaves plain ascii untouched', () => {
    expect(encodeHeaderValue('Una duda')).toBe('Una duda');
  });

  it('encodes non-ascii as base64 words', () => {
    expect(encodeHeaderValue('Recursión')).toMatch(/^=\?UTF-8\?B\?.+\?=$/);
  });

  it('strips newlines to prevent header injection', () => {
    expect(encodeHeaderValue('a\r\nBcc: victim@example.com')).toBe('a Bcc: victim@example.com');
  });
});

describe('buildMimeMessage', () => {
  it('terminates the payload with a lone dot', () => {
    expect(buildMimeMessage(message).endsWith('\r\n.\r\n')).toBe(true);
  });

  it('normalises line endings to CRLF', () => {
    expect(buildMimeMessage(message)).toContain('Primera línea\r\nSegunda línea');
  });

  it('escapes a leading dot in the body', () => {
    const built = buildMimeMessage({ ...message, body: '.oculto' });
    expect(built).toContain('..oculto');
  });

  it('carries the reply-to of the person writing', () => {
    expect(buildMimeMessage(message)).toContain('Reply-To: ana@ejemplo.com');
  });
});

describe('encodeCredentials', () => {
  it('separates the parts with null bytes', () => {
    const decoded = atob(encodeCredentials('user', 'pass'));
    expect(decoded).toBe(`${String.fromCharCode(0)}user${String.fromCharCode(0)}pass`);
  });
});

describe('isCompleteResponse', () => {
  it('treats a continuation line as incomplete', () => {
    expect(isCompleteResponse('250-PIPELINING\r\n')).toBe(false);
  });

  it('treats a final line as complete', () => {
    expect(isCompleteResponse('250-PIPELINING\r\n250 OK\r\n')).toBe(true);
  });

  it('treats an empty buffer as incomplete', () => {
    expect(isCompleteResponse('')).toBe(false);
  });
});

describe('expectStatus', () => {
  it('accepts the expected code', () => {
    expect(() => expectStatus('250 OK\r\n', 250)).not.toThrow();
  });

  it('throws a typed error on a different code', () => {
    expect(() => expectStatus('535 Auth failed\r\n', 235)).toThrow(SmtpError);
  });
});
