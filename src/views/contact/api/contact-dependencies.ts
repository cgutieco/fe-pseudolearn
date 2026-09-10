import { createCloudflareTurnstileGateway } from '@entities/contact-request/api/cloudflare-turnstile-gateway';
import { createOciSmtpMailGateway } from '@entities/contact-request/api/oci-smtp-mail-gateway';
import { getRuntimeEnv, requireSecret } from '@shared/lib/runtime-env';
import type { ContactDependencies } from './handle-contact-request';

const DEFAULT_SMTP_PORT = 587;

export function createContactDependencies(locals: unknown, userAgent: string | null): ContactDependencies {
  const environment = getRuntimeEnv(locals);
  return {
    botChallenge: createCloudflareTurnstileGateway(requireSecret(environment, 'TURNSTILE_SECRET_KEY')),
    mail: createOciSmtpMailGateway({
      host: requireSecret(environment, 'OCI_SMTP_HOST'),
      port: Number(environment.OCI_SMTP_PORT ?? DEFAULT_SMTP_PORT),
      username: requireSecret(environment, 'OCI_SMTP_USERNAME'),
      password: requireSecret(environment, 'OCI_SMTP_PASSWORD'),
      fromAddress: requireSecret(environment, 'CONTACT_FROM_ADDRESS'),
      toAddress: requireSecret(environment, 'CONTACT_TO_ADDRESS'),
      userAgent,
    }),
  };
}
