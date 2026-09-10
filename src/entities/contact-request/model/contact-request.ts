export const CONTACT_REASONS = ['error', 'feature', 'improvement', 'question'] as const;

export type ContactReason = (typeof CONTACT_REASONS)[number];

export const FREQUENCIES = ['once', 'sometimes', 'always'] as const;

export type Frequency = (typeof FREQUENCIES)[number];

export type FieldErrorCode = 'required' | 'invalid' | 'too_long' | 'unknown_option';

export interface ContactRequest {
  readonly reason: ContactReason;
  readonly email: string;
  readonly name: string;
  readonly message: string;
  readonly locale: string;
  readonly includeEnvironment: boolean;
  readonly platform?: string;
  readonly appVersion?: string;
  readonly executionStep?: string;
  readonly codeSnippet?: string;
  readonly featureIntent?: string;
  readonly currentWorkaround?: string;
  readonly frequency?: Frequency;
  readonly appArea?: string;
  readonly friction?: string;
  readonly subject?: string;
}

export type ContactOutcome =
  | { readonly status: 'ok' }
  | { readonly status: 'bad_request' }
  | { readonly status: 'captcha_failed' }
  | { readonly status: 'validation_error'; readonly fields: Readonly<Record<string, FieldErrorCode>> }
  | { readonly status: 'mail_failed' }
  | { readonly status: 'rate_limited' };

export function isContactReason(candidate: string): candidate is ContactReason {
  return (CONTACT_REASONS as readonly string[]).includes(candidate);
}

export function isFrequency(candidate: string): candidate is Frequency {
  return (FREQUENCIES as readonly string[]).includes(candidate);
}
