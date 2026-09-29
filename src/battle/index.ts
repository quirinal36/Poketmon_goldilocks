// STUB — owned by the BATTLE agent.
import type { BattleService } from '../core/types';
export function createBattle(): BattleService {
  return {
    async wild() { return 'fled'; }, async trainer() { return 'won'; }, async giveExp() {}, async checkEvolutions() {},
  };
}
