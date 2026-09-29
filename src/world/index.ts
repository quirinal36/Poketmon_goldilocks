// STUB — owned by the ENGINE agent.
import type { WorldService } from '../core/types';
export function createWorld(): WorldService {
  const w: WorldService = {
    mapId: 'player_house_2f', async warp() {}, start() {}, lock() {}, unlock() {}, async runScript() {},
    async movePlayer() {}, async moveNpc() {}, faceNpc() {}, facePlayer() {}, setNpcVisible() {}, spawnNpc() {}, removeNpc() {},
    getPlayerPos: () => ({ x: 0, y: 0, facing: 'down' }), wait: (ms) => new Promise((r) => setTimeout(r, ms)), async emote() {},
    refreshNpcs() {}, healParty() {},
  };
  return w;
}
