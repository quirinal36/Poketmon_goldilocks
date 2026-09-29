// STUB — owned by the AUDIO agent.
import type { AudioService } from '../core/types';
export function createAudio(): AudioService {
  return {
    unlock() {}, playMusic() {}, playSfx() {}, playCry() {}, async jingle() {}, setVolumes() {},
    async speak() {}, stopSpeaking() {}, ttsAvailable: () => false,
  };
}
