// STUB — owned by the NET agent.
import type { NetService } from '../core/types';
export function createNet(): NetService {
  return {
    online: false, async init() {}, async pullSave() { return null; }, pushSave() {},
    async flushLogs() { return false; }, async fetchQuestions() { return null; }, async fetchCurriculum() { return null; },
    async createTransferCode() { return null; }, async claimTransferCode() { return null; },
  };
}
