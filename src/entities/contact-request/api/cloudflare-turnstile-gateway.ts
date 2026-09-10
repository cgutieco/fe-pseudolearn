import type { BotChallengeGateway, BotChallengeResult } from './bot-challenge-gateway';

const VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 4000;

export function createCloudflareTurnstileGateway(secretKey: string): BotChallengeGateway {
  return {
    async verify(token, remoteAddress): Promise<BotChallengeResult> {
      if (token.trim() === '') return { kind: 'failed' };
      const body = new FormData();
      body.append('secret', secretKey);
      body.append('response', token);
      if (remoteAddress) body.append('remoteip', remoteAddress);

      try {
        const response = await fetch(VERIFY_ENDPOINT, {
          method: 'POST',
          body,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!response.ok) return { kind: 'unavailable' };
        const payload = (await response.json()) as { success?: boolean };
        return payload.success === true ? { kind: 'passed' } : { kind: 'failed' };
      } catch {
        return { kind: 'unavailable' };
      }
    },
  };
}
