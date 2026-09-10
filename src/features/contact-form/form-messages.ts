export interface ClientMessages {
  readonly counter: string;
  readonly emailRequired: string;
  readonly emailInvalid: string;
  readonly emailMissingAt: string;
  readonly emailMissingDomain: string;
  readonly sending: string;
  readonly success: string;
  readonly badRequest: string;
  readonly captchaFailed: string;
  readonly validationError: string;
  readonly mailFailed: string;
  readonly rateLimited: string;
  readonly networkError: string;
}

const OUTCOME_TO_MESSAGE: Record<string, keyof ClientMessages> = {
  ok: 'success',
  bad_request: 'badRequest',
  captcha_failed: 'captchaFailed',
  validation_error: 'validationError',
  mail_failed: 'mailFailed',
  rate_limited: 'rateLimited',
};

export function messageForOutcome(messages: ClientMessages, status: string): string {
  const key = OUTCOME_TO_MESSAGE[status];
  return key ? messages[key] : messages.networkError;
}

export function emailMessage(messages: ClientMessages, value: string): string {
  if (value.trim() === '') return messages.emailRequired;
  if (!value.includes('@')) return messages.emailMissingAt;
  if (value.endsWith('@')) return messages.emailMissingDomain;
  return messages.emailInvalid;
}

export function renderCounter(template: string, used: number, total: number): string {
  return template.replace('{used}', String(used)).replace('{total}', String(total));
}
