import type { BotChallengeGateway } from '@entities/contact-request/api/bot-challenge-gateway';
import type { MailGateway } from '@entities/contact-request/api/mail-gateway';
import type { ContactOutcome } from '@entities/contact-request/model/contact-request';
import { validateContactRequest } from '@entities/contact-request/model/validate-contact-request';

export interface ContactDependencies {
  readonly botChallenge: BotChallengeGateway;
  readonly mail: MailGateway;
}

export async function handleContactRequest(
  request: Request,
  dependencies: ContactDependencies,
): Promise<ContactOutcome> {
  const fields = await readFormFields(request);
  if (fields === null) return { status: 'bad_request' };

  const challenge = await dependencies.botChallenge.verify(
    fields.turnstileToken ?? '',
    request.headers.get('cf-connecting-ip'),
  );
  if (challenge.kind === 'failed') return { status: 'captcha_failed' };
  if (challenge.kind === 'unavailable') return { status: 'mail_failed' };

  const validation = validateContactRequest(fields);
  if (validation.kind === 'invalid') return { status: 'validation_error', fields: validation.fields };

  const delivery = await dependencies.mail.deliver(validation.request);
  if (delivery.kind === 'sent') return { status: 'ok' };
  return { status: 'mail_failed' };
}

async function readFormFields(request: Request): Promise<Record<string, string> | null> {
  const contentType = request.headers.get('content-type') ?? '';
  const isForm =
    contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded');
  if (!isForm) return null;

  try {
    const form = await request.formData();
    const fields: Record<string, string> = {};
    for (const [name, value] of form.entries()) {
      if (typeof value === 'string') fields[name] = value;
    }
    return fields;
  } catch {
    return null;
  }
}

export function outcomeToResponse(outcome: ContactOutcome): Response {
  const httpStatus = outcome.status === 'ok' ? 200 : statusCodeFor(outcome.status);
  return new Response(JSON.stringify(outcome), {
    status: httpStatus,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function statusCodeFor(status: string): number {
  if (status === 'bad_request' || status === 'validation_error') return 400;
  if (status === 'captcha_failed') return 403;
  if (status === 'rate_limited') return 429;
  return 502;
}
