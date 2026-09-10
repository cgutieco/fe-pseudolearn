import { describe, expect, it } from 'vitest';
import { createFakeBotChallengeGateway } from '@entities/contact-request/testing/fake-bot-challenge-gateway';
import { createFakeMailGateway } from '@entities/contact-request/testing/fake-mail-gateway';
import { handleContactRequest, outcomeToResponse } from './handle-contact-request';

function formRequest(fields: Record<string, string>): Request {
  const body = new URLSearchParams(fields);
  return new Request('https://pseudolearn.app/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
}

const validFields = {
  reason: 'question',
  email: 'ana@ejemplo.com',
  message: 'Una duda sobre recursión.',
  acceptPrivacy: 'on',
  locale: 'es',
  turnstileToken: 'token',
};

const passing = createFakeBotChallengeGateway({ kind: 'passed' });

describe('handleContactRequest', () => {
  it('delivers a valid submission', async () => {
    const mail = createFakeMailGateway();
    const outcome = await handleContactRequest(formRequest(validFields), { botChallenge: passing, mail });
    expect(outcome.status).toBe('ok');
    expect(mail.delivered).toHaveLength(1);
  });

  it('rejects a body that is not a form', async () => {
    const request = new Request('https://pseudolearn.app/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    const outcome = await handleContactRequest(request, {
      botChallenge: passing,
      mail: createFakeMailGateway(),
    });
    expect(outcome.status).toBe('bad_request');
  });

  it('stops before delivery when the challenge fails', async () => {
    const mail = createFakeMailGateway();
    const gateway = createFakeBotChallengeGateway({ kind: 'failed' });
    const outcome = await handleContactRequest(formRequest(validFields), { botChallenge: gateway, mail });
    expect(outcome.status).toBe('captcha_failed');
    expect(mail.delivered).toHaveLength(0);
  });

  it('reports a mail failure when the challenge service is unreachable', async () => {
    const gateway = createFakeBotChallengeGateway({ kind: 'unavailable' });
    const outcome = await handleContactRequest(formRequest(validFields), {
      botChallenge: gateway,
      mail: createFakeMailGateway(),
    });
    expect(outcome.status).toBe('mail_failed');
  });

  it('returns machine readable field codes and never localized text', async () => {
    const outcome = await handleContactRequest(formRequest({ turnstileToken: 'token' }), {
      botChallenge: passing,
      mail: createFakeMailGateway(),
    });
    expect(outcome.status).toBe('validation_error');
    const serialised = JSON.stringify(outcome);
    expect(serialised).not.toMatch(/[áéíóúñ¿¡]/i);
  });

  it('reports a rejected delivery', async () => {
    const mail = createFakeMailGateway({ kind: 'rejected' });
    const outcome = await handleContactRequest(formRequest(validFields), { botChallenge: passing, mail });
    expect(outcome.status).toBe('mail_failed');
  });
});

describe('outcomeToResponse', () => {
  it('answers 200 on success and never caches', () => {
    const response = outcomeToResponse({ status: 'ok' });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('maps each failure to its http status', () => {
    expect(outcomeToResponse({ status: 'bad_request' }).status).toBe(400);
    expect(outcomeToResponse({ status: 'captcha_failed' }).status).toBe(403);
    expect(outcomeToResponse({ status: 'rate_limited' }).status).toBe(429);
    expect(outcomeToResponse({ status: 'mail_failed' }).status).toBe(502);
  });
});
