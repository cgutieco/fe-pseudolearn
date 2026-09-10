import type { BotChallengeGateway, BotChallengeResult } from '../api/bot-challenge-gateway';

export function createFakeBotChallengeGateway(result: BotChallengeResult): BotChallengeGateway {
  return { verify: () => Promise.resolve(result) };
}
