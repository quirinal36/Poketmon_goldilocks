// A grid-walking character (player, NPC, follower). Movement is 16 px per tile at `speed` px/frame
// (walk 1 = 16 frames ≈ 267 ms, run 2). Ledge hops cover 2 tiles with a small arc.
import type { Dir, NpcSpriteId, PlayerAppearance } from '../core/types';
import { TILE } from '../core/types';
import { DELTA } from './path';

export type SpriteRef = NpcSpriteId | PlayerAppearance | null;

export class Entity {
  facing: Dir = 'down';
  moving = false;
  fromX = 0;
  fromY = 0;
  dist = TILE;
  progress = 0;
  speed = 1;
  hop = false;
  stepToggle = false;
  /** frames left of the "walking against a wall" animation */
  bumpFrames = 0;
  visible = true;
  emote: { e: string; until: number } | null = null;
  private waiters: (() => void)[] = [];

  constructor(public id: string, public x: number, public y: number, public sprite: SpriteRef) {}

  setPos(x: number, y: number, facing?: Dir): void {
    this.x = x; this.y = y; this.moving = false; this.progress = 0; this.hop = false; this.bumpFrames = 0;
    if (facing) this.facing = facing;
    this.flushWaiters();
  }

  startMove(dir: Dir, tiles = 1, speed = 1, hop = false): void {
    this.facing = dir;
    this.fromX = this.x; this.fromY = this.y;
    this.x += DELTA[dir][0] * tiles;
    this.y += DELTA[dir][1] * tiles;
    this.dist = tiles * TILE;
    this.progress = 0;
    this.speed = Math.max(0.25, speed);
    this.hop = hop;
    this.moving = true;
    this.bumpFrames = 0;
    this.stepToggle = !this.stepToggle;
  }

  bump(): void {
    if (this.bumpFrames <= 0) { this.bumpFrames = 16; this.stepToggle = !this.stepToggle; }
  }

  /** Advance one frame; returns true when a move finished this frame. */
  tick(): boolean {
    if (this.bumpFrames > 0) this.bumpFrames--;
    if (!this.moving) return false;
    this.progress += this.speed;
    if (this.progress >= this.dist - 1e-6) {
      this.moving = false; this.progress = 0; this.hop = false;
      this.flushWaiters();
      return true;
    }
    return false;
  }

  waitArrive(): Promise<void> {
    if (!this.moving) return Promise.resolve();
    return new Promise((r) => this.waiters.push(r));
  }

  private flushWaiters(): void {
    const w = this.waiters; this.waiters = [];
    for (const f of w) f();
  }

  /** Interpolated pixel position (top-left of the tile) and vertical lift for hops. */
  pixel(): { px: number; py: number; lift: number } {
    if (!this.moving) return { px: this.x * TILE, py: this.y * TILE, lift: 0 };
    const t = Math.min(1, this.progress / this.dist);
    const px = (this.fromX + (this.x - this.fromX) * t) * TILE;
    const py = (this.fromY + (this.y - this.fromY) * t) * TILE;
    const lift = this.hop ? Math.sin(t * Math.PI) * 6 : 0;
    return { px: Math.round(px), py: Math.round(py), lift: Math.round(lift) };
  }

  /** Animation frame: 0 stand, 1/2 alternating step frames. */
  frame(): 0 | 1 | 2 {
    let p: number;
    if (this.moving) {
      if (this.hop) return this.stepToggle ? 1 : 2;
      p = (this.progress / this.dist) * TILE;
    } else if (this.bumpFrames > 0) {
      p = TILE - this.bumpFrames;
    } else return 0;
    return p < TILE / 2 ? (this.stepToggle ? 1 : 2) : 0;
  }
}
