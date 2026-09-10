export type BotChallengeResult =
  { readonly kind: 'passed' } | { readonly kind: 'failed' } | { readonly kind: 'unavailable' };

export interface BotChallengeGateway {
  verify(token: string, remoteAddress: string | null): Promise<BotChallengeResult>;
}
