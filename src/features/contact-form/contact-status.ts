import type { ContactOutcome } from '@entities/contact-request/model/contact-request';

export type ContactStatusKind = 'success' | 'error';

export interface ContactStatus {
  readonly kind: ContactStatusKind;
  readonly translationKey: string;
}

const STATUS_KEYS: Record<string, string> = {
  ok: 'contact.status.success',
  bad_request: 'contact.status.badRequest',
  captcha_failed: 'contact.status.captchaFailed',
  validation_error: 'contact.status.validationError',
  mail_failed: 'contact.status.mailFailed',
  rate_limited: 'contact.status.rateLimited',
};

export const NETWORK_ERROR_KEY = 'contact.status.networkError';

export function statusFor(outcome: Pick<ContactOutcome, 'status'>): ContactStatus {
  return {
    kind: outcome.status === 'ok' ? 'success' : 'error',
    translationKey: STATUS_KEYS[outcome.status] ?? NETWORK_ERROR_KEY,
  };
}

export function fieldErrorKey(code: string): string {
  if (code === 'required') return 'contact.error.emailRequired';
  if (code === 'too_long') return 'contact.error.messageTooLong';
  return 'contact.error.emailInvalid';
}

export function emailErrorKey(value: string): string {
  if (value.trim() === '') return 'contact.error.emailRequired';
  if (!value.includes('@')) return 'contact.error.emailMissingAt';
  if (value.endsWith('@')) return 'contact.error.emailMissingDomain';
  return 'contact.error.emailInvalid';
}
