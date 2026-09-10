import { env } from 'cloudflare:workers';

export interface RuntimeEnvironment {
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly OCI_SMTP_HOST?: string;
  readonly OCI_SMTP_PORT?: string;
  readonly OCI_SMTP_USERNAME?: string;
  readonly OCI_SMTP_PASSWORD?: string;
  readonly CONTACT_FROM_ADDRESS?: string;
  readonly CONTACT_TO_ADDRESS?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

export function getRuntimeEnv(locals?: unknown): RuntimeEnvironment {
  if (typeof env !== 'undefined' && env && Object.keys(env).length > 0) {
    return env as unknown as RuntimeEnvironment;
  }
  if (locals && typeof locals === 'object' && 'runtime' in locals) {
    const fromLocals = (locals as { runtime?: { env?: unknown } }).runtime?.env as
      RuntimeEnvironment | undefined;
    if (fromLocals) return fromLocals;
  }
  return process.env as unknown as RuntimeEnvironment;
}

export function requireSecret(environment: RuntimeEnvironment, name: keyof RuntimeEnvironment): string {
  const value = environment[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing runtime secret: ${String(name)}`);
  }
  return value;
}
