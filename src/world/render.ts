// Overworld renderer: tiles (with border outside the map), structures, item balls, y-sorted
// characters (NPCs / player / partner follower) and emote bubbles. GBC-style camera centered on
// the player; map edges show border tiles.
import type { TileId } from '../core/types';
import { TILE } from '../core/types';
import { drawCharacter, drawEmote, drawStructure, drawTile, itemIcon } from '../art';
import type { Entity } from './entity';
import { maskAt, tileAt, type RuntimeMap } from './mapdata';

export interface DrawChar { ent: Entity; order: number }
export interface DrawItem { x: number; y: number }
export interface FollowerDraw { ent: Entity; speciesId: number }

export interface RenderState {
  rm: RuntimeMap;
  camX: number;
  camY: number;
  frame: number;
  viewW: number;
  viewH: number;
  chars: DrawChar[];
  items: DrawItem[];
  follower: FollowerDraw | null;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private ballIcon: HTMLCanvasElement | null = null;
  private icons: HTMLImageElement | null = null;
  private iconCell = 32;
  private iconCols = 16;
  private iconsFailed = false;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
  }

  loadIcons(url: string, cell: number, cols: number): void {
    this.iconCell = cell || 32;
    this.iconCols = cols || 16;
    const img = new Image();
    img.onload = () => { this.icons = img; };
    img.onerror = () => { this.iconsFailed = true; };
    try { img.src = url; } catch { this.iconsFailed = true; }
  }

  private getBallIcon(): HTMLCanvasElement | null {
    if (this.ballIcon) return this.ballIcon;
    try { this.ballIcon = itemIcon('pokeball', 16); } catch { this.ballIcon = null; }
    return this.ballIcon;
  }

  draw(s: RenderState): void {
    const { ctx } = this;
    const { rm, camX, camY, frame, viewW, viewH } = s;
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, viewW, viewH);

    // tiles
    const tx0 = Math.floor(camX / TILE), ty0 = Math.floor(camY / TILE);
    const tx1 = Math.floor((camX + viewW - 1) / TILE), ty1 = Math.floor((camY + viewH - 1) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const id: TileId = tileAt(rm, tx, ty);
        const mask = maskAt(rm, tx, ty);
        try {
          drawTile(ctx, id, tx * TILE - camX, ty * TILE - camY, frame, mask);
        } catch (e) {
          ctx.fillStyle = '#f0f';
          ctx.fillRect(tx * TILE - camX, ty * TILE - camY, TILE, TILE);
        }
      }
    }

    // structures
    for (const st of rm.structures) {
      const px = st.x * TILE - camX, py = st.y * TILE - camY;
      if (px + st.w * TILE < 0 || py + st.h * TILE < -TILE || px > viewW || py > viewH) continue;
      try { drawStructure(ctx, st.kind, px, py, frame); } catch (e) { /* ignore */ }
    }

    // item balls
    const ball = this.getBallIcon();
    for (const it of s.items) {
      const px = it.x * TILE - camX, py = it.y * TILE - camY;
      if (px < -TILE || py < -TILE || px > viewW || py > viewH) continue;
      if (ball) ctx.drawImage(ball, px, py);
      else {
        ctx.fillStyle = '#e03030'; ctx.fillRect(px + 4, py + 4, 8, 4);
        ctx.fillStyle = '#fff'; ctx.fillRect(px + 4, py + 8, 8, 4);
        ctx.fillStyle = '#000'; ctx.fillRect(px + 4, py + 7, 8, 1);
      }
    }

    // characters, y-sorted (follower before others at the same y)
    type Drawable = { py: number; order: number; draw: () => void; emote?: { ent: Entity; px: number; py: number } };
    const list: Drawable[] = [];
    for (const c of s.chars) {
      const { ent } = c;
      if (!ent.visible || !ent.sprite) continue;
      const p = ent.pixel();
      const px = p.px - camX, py = p.py - camY;
      if (px < -TILE * 2 || py < -TILE * 2 || px > viewW + TILE || py > viewH + TILE) continue;
      const sprite = ent.sprite;
      const dir = ent.facing;
      const fr = ent.frame();
      const lift = p.lift;
      list.push({
        py: p.py, order: c.order,
        draw: () => { try { drawCharacter(ctx, sprite, dir, fr, px, py - lift); } catch { /* ignore */ } },
        emote: ent.emote ? { ent, px, py: py - lift } : undefined,
      });
    }
    if (s.follower) {
      const { ent, speciesId } = s.follower;
      if (ent.visible) {
        const p = ent.pixel();
        const px = p.px - camX, py = p.py - camY;
        if (!(px < -TILE * 2 || py < -TILE * 2 || px > viewW + TILE || py > viewH + TILE)) {
          const bob = ent.moving ? (Math.floor(ent.progress / 4) % 2) : (frame % 2);
          const lift = p.lift;
          list.push({
            py: p.py, order: 0,
            draw: () => this.drawFollower(speciesId, px, py - lift - bob),
            emote: ent.emote ? { ent, px, py: py - lift } : undefined,
          });
        }
      }
    }
    list.sort((a, b) => a.py - b.py || a.order - b.order);
    for (const d of list) d.draw();
    for (const d of list) {
      if (!d.emote) continue;
      try { drawEmote(ctx, d.emote.ent.emote!.e, d.emote.px, d.emote.py); } catch { /* ignore */ }
    }
  }

  private drawFollower(speciesId: number, px: number, py: number): void {
    const { ctx } = this;
    const img = this.icons;
    if (img && img.complete && img.naturalWidth > 0) {
      const idx = Math.max(0, speciesId - 1);
      const c = this.iconCell;
      const sx = (idx % this.iconCols) * c;
      const sy = Math.floor(idx / this.iconCols) * c;
      // 32x32 icon centered on the tile, bottom-aligned
      ctx.drawImage(img, sx, sy, c, c, px + TILE / 2 - c / 2, py + TILE - c, c, c);
      return;
    }
    // placeholder: small round critter
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 3, py + 4, 10, 10);
    ctx.fillStyle = this.iconsFailed ? '#f0c040' : '#a0a0a0';
    ctx.fillRect(px + 4, py + 5, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 6, py + 7, 1, 2);
    ctx.fillRect(px + 9, py + 7, 1, 2);
  }
}
