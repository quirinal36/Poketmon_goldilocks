// Overworld runtime — implements WorldService (core/types.ts) per DESIGN §7.
// Grid movement (16 frames/tile, B = run), ledges, warps, edge exits, NPCs (wander/turn/trainer sight),
// counters, signs, objects, item balls, triggers, tall-grass encounters, fishing, partner follower,
// emotes, scripted movement, scripts with input lock, tap-to-walk (BFS).
import type {
  AreaId, BattleOutcome, Dir, ExitDef, ItemBallDef, MapDef, MapId, NpcDef, ScriptContext, ScriptId,
  SignDef, WarpDef, WorldService,
} from '../core/types';
import { TILE } from '../core/types';
import { G } from '../game';
import { input } from '../core/input';
import { layout } from '../core/layout';
import { josa, pick, sleep } from '../core/util';
import { MAPS } from '../maps/index';
import { SCRIPTS } from '../story/index';
import { itemName } from '../data/items';
import { buildMap, footAt, inBounds, infoAt, key, terrainBlocked, tileAt, type ObjectDef, type RuntimeMap } from './mapdata';
import { Entity } from './entity';
import { DELTA, DIR_ORDER, OPPOSITE, dirTo, findPath, findPathToAny, type Pt } from './path';
import { evalFlag } from './flags';
import { rollEncounter } from './encounters';
import { Renderer } from './render';

export interface WorldServiceExt extends WorldService {
  /** Override/extend a map definition at runtime (debug/test maps). */
  registerMap(def: MapDef): void;
  isLocked(): boolean;
  /** true once start() was called */
  readonly started: boolean;
  /** Set the whiteout respawn point (default: current map's healSpot or player tile). */
  setLastHeal(pos?: { map: MapId; x: number; y: number }): void;
  /** "힘이 빠져서…" → warp to lastHeal + heal (used after a lost battle). */
  whiteout(): Promise<void>;
  /** warp without fade (debug). */
  teleport(map: MapId, x: number, y: number, facing?: Dir): Promise<void>;
  /** Force an encounter now (debug / fishing spots). */
  startWildBattle(area: AreaId, opts?: { fishing?: boolean }): Promise<void>;
  /** Open the start menu with the world locked (HUD ☰ / START). */
  openMenu(): Promise<void>;
  /** Open the daily plan screen with the world locked (HUD 📖 pill). */
  openDailyPlan(): Promise<void>;
  /** Re-evaluate item balls on the ground (after flags change). */
  refreshItems(): void;
}

const STEP_MS = 1000 / 60;
const TURN_FRAMES = 4;          // frames a new direction must be held before walking (quick tap = turn)
const BUMP_SFX_MS = 350;
const ENCOUNTER_RATE = 0.1;
const ENCOUNTER_PITY = 12;
const TAP_MAX_STEPS = 40;
const DIRS: readonly Dir[] = DIR_ORDER;

interface NpcRt {
  def: NpcDef;
  ent: Entity;
  ox: number;
  oy: number;
  timer: number;
  temp: boolean;
  visible: boolean;
  forced?: boolean;
  scripted: number;
}

type Interactable =
  | { kind: 'npc'; npc: NpcRt }
  | { kind: 'item'; item: ItemBallDef }
  | { kind: 'sign'; sign: SignDef }
  | { kind: 'object'; obj: ObjectDef }
  | { kind: 'follower' }
  | { kind: 'fish' };

function testHooks(): { autoAnswer?: 'correct' | 'wrong'; fastText?: boolean } | undefined {
  return (window as any).__TEST__;
}

let instance: WorldServiceExt | null = null;

export function createWorld(): WorldServiceExt {
  // ------------------------------------------------------------------ state
  const overrides = new Map<MapId, MapDef>();
  const cache = new Map<MapId, RuntimeMap>();
  let rm: RuntimeMap | null = null;
  let mapId: MapId = 'player_house_2f';
  const player = new Entity('player', 4, 4, null);
  let npcs: NpcRt[] = [];
  let follower: Entity | null = null;
  let followerSpecies = 0;
  let followerQueue: Pt[] = [];
  let items: ItemBallDef[] = [];
  let lockCount = 0;
  let scriptDepth = 0;
  let started = false;
  let loopRunning = false;
  let busy = false;
  let frame = 0;
  const t0 = performance.now();
  let last = 0;
  let acc = 0;
  let camX = 0, camY = 0;
  let autoPath: Dir[] = [];
  let tapTarget: { x: number; y: number; it: Interactable | null } | null = null;
  let turnWait = 0;
  let lastHeld: Dir | null = null;
  let scriptedMoves = 0;
  let grassSteps = 0;
  let lastBumpAt = 0;
  let renderer: Renderer | null = null;
  let iconsLoaded = false;

  const canvas = document.getElementById('world') as HTMLCanvasElement | null;

  // ---------------------------------------------------------------- helpers
  const isLocked = () => lockCount > 0;
  const defeated = () => G.save?.data?.defeatedTrainers ?? [];
  const isDefeated = (id: string) => defeated().includes(id);

  function emptyMap(id: MapId): MapDef {
    return {
      id, name: id, width: 10, height: 8, border: 'tree', music: 'town', indoor: false,
      tiles: ['TTTTTTTTTT', 'T........T', 'T........T', 'T........T', 'T........T', 'T........T', 'T........T', 'TTTTTTTTTT'],
      warps: [], npcs: [],
    };
  }

  function getDef(id: MapId): MapDef {
    const d = overrides.get(id) ?? (MAPS as Record<string, MapDef | undefined>)[id];
    if (!d) { console.error(`[world] unknown map '${id}'`); return emptyMap(id); }
    return d;
  }

  function getRuntime(id: MapId): RuntimeMap {
    let r = cache.get(id);
    if (!r) { r = buildMap(getDef(id)); cache.set(id, r); }
    return r;
  }

  function npcAt(x: number, y: number, except?: NpcRt): NpcRt | null {
    for (const n of npcs) {
      if (n === except || !n.visible) continue;
      const e = n.ent;
      if ((e.x === x && e.y === y) || (e.moving && e.fromX === x && e.fromY === y)) return n;
    }
    return null;
  }

  function itemAt(x: number, y: number): ItemBallDef | null {
    for (const it of items) if (it.x === x && it.y === y) return it;
    return null;
  }

  function followerAt(x: number, y: number): boolean {
    return !!follower && follower.visible && follower.x === x && follower.y === y;
  }

  /** Blocking for the player: terrain, NPCs, item balls (follower excluded). */
  function blockedForPlayer(x: number, y: number): boolean {
    if (!rm) return true;
    return terrainBlocked(rm, x, y) || !!npcAt(x, y) || !!itemAt(x, y);
  }

  function blockedForNpc(x: number, y: number, self: NpcRt): boolean {
    if (!rm) return true;
    if (terrainBlocked(rm, x, y)) return true;
    if (infoAt(rm, x, y).grass && rm.def.area) { /* NPCs may walk in grass */ }
    if (rm.warps.has(key(x, y))) return true;
    if (npcAt(x, y, self)) return true;
    if (itemAt(x, y)) return true;
    if ((player.x === x && player.y === y) || (player.moving && player.fromX === x && player.fromY === y)) return true;
    if (followerAt(x, y)) return true;
    return false;
  }

  const passableForPath = (x: number, y: number) => !blockedForPlayer(x, y);

  function findNpc(id: string): NpcRt | null {
    return npcs.find((n) => n.def.id === id) ?? null;
  }

  function entOf(target: string): Entity | null {
    if (target === 'player') return player;
    if (target === 'follower') return follower;
    return findNpc(target)?.ent ?? null;
  }

  function syncSavePos(): void {
    const s = G.save?.data;
    if (!s) return;
    s.pos = { map: mapId, x: player.x, y: player.y, facing: player.facing };
  }

  function restoreMusic(): void {
    if (rm) { try { G.audio.playMusic(rm.def.music); } catch { /* ignore */ } }
  }

  function sfx(id: Parameters<typeof G.audio.playSfx>[0]): void {
    try { G.audio.playSfx(id); } catch { /* ignore */ }
  }

  function cancelAuto(): void {
    autoPath = [];
    tapTarget = null;
  }

  // ------------------------------------------------------------ npcs/items
  function makeNpc(def: NpcDef, temp: boolean): NpcRt {
    const ent = new Entity(def.id, def.x, def.y, def.sprite);
    ent.facing = def.facing ?? 'down';
    return { def, ent, ox: def.x, oy: def.y, timer: 30 + Math.floor(Math.random() * 90), temp, visible: evalFlag(def.visibleIf, G.save?.data?.flags ?? {}), scripted: 0 };
  }

  function refreshNpcs(): void {
    const flags = G.save?.data?.flags ?? {};
    for (const n of npcs) {
      if (n.forced !== undefined) n.visible = n.forced;
      else n.visible = evalFlag(n.def.visibleIf, flags);
      n.ent.visible = n.visible;
    }
    refreshItems();
  }

  function refreshItems(): void {
    if (!rm) { items = []; return; }
    items = (rm.def.items ?? []).filter((it) => !G.save?.flag(`item_${mapId}_${it.id}`));
  }

  // -------------------------------------------------------------- follower
  function syncFollower(): void {
    const sid = G.save?.data?.party?.[0]?.speciesId ?? 0;
    if (sid === followerSpecies && (!!follower === sid > 0)) return;
    followerSpecies = sid;
    if (sid > 0) {
      follower = new Entity('follower', player.x, player.y, null);
      placeFollowerBehind();
    } else {
      follower = null;
      followerQueue = [];
    }
  }

  function placeFollowerBehind(): void {
    followerQueue = [];
    if (!follower || !rm) return;
    const [dx, dy] = DELTA[OPPOSITE[player.facing]];
    const bx = player.x + dx, by = player.y + dy;
    if (inBounds(rm, bx, by) && !terrainBlocked(rm, bx, by) && !npcAt(bx, by) && !itemAt(bx, by)) follower.setPos(bx, by, player.facing);
    else follower.setPos(player.x, player.y, player.facing);
  }

  function updateFollower(): void {
    if (!follower) return;
    follower.tick();
    if (follower.moving) return;
    if (!followerQueue.length) return;
    const target = followerQueue[0];
    if (target.x === follower.x && target.y === follower.y) { followerQueue.shift(); return; }
    const dx = target.x - follower.x, dy = target.y - follower.y;
    const speed = followerQueue.length > 1 ? 2 : player.moving ? player.speed : 1;
    if (Math.abs(dx) + Math.abs(dy) === 1) follower.startMove(dirTo(follower, target), 1, speed, false);
    else if (dx === 0 && dy === 2) follower.startMove('down', 2, speed, true);
    else follower.setPos(target.x, target.y, dirTo(follower, target));
    followerQueue.shift();
  }

  // ---------------------------------------------------------------- player
  function playerStep(dir: Dir, tiles: number, speed: number, hop: boolean): void {
    followerQueue.push({ x: player.x, y: player.y });
    if (followerQueue.length > 4) followerQueue.splice(0, followerQueue.length - 4);
    player.startMove(dir, tiles, speed, hop);
  }

  function bump(): void {
    player.bump();
    const now = performance.now();
    if (now - lastBumpAt > BUMP_SFX_MS) { lastBumpAt = now; sfx('bump'); }
  }

  function findExit(dir: Dir, x: number, y: number): ExitDef | null {
    if (!rm) return null;
    const vertical = dir === 'up' || dir === 'down';
    const c = vertical ? x : y;
    for (const e of rm.def.exits ?? []) {
      if (e.dir !== dir) continue;
      const from = e.from ?? 0;
      const range = e.toRange ?? (vertical ? rm.w : rm.h);
      if (c >= from && c < from + range) return e;
    }
    return null;
  }

  /** Try to walk one tile. Returns true when a move (or transition) started. */
  function tryStep(dir: Dir, running: boolean): boolean {
    if (!rm) return false;
    const [dx, dy] = DELTA[dir];
    const nx = player.x + dx, ny = player.y + dy;
    if (!inBounds(rm, nx, ny)) {
      const ex = findExit(dir, player.x, player.y);
      if (ex) { void doExit(ex, dir); return true; }
      bump();
      return false;
    }
    const info = infoAt(rm, nx, ny);
    const speed = running ? 2 : 1;
    if (info.ledge === 'down' && dir === 'down' && footAt(rm, nx, ny) !== 1) {
      const lx = nx, ly = ny + 1;
      if (inBounds(rm, lx, ly) && !blockedForPlayer(lx, ly)) {
        playerStep(dir, 2, speed, true);
        sfx('ledge');
        return true;
      }
      bump();
      return false;
    }
    if (blockedForPlayer(nx, ny)) { bump(); return false; }
    playerStep(dir, 1, speed, false);
    if (info.grass) sfx('grass');
    return true;
  }

  function handlePlayerInput(): void {
    const manual = input.heldDir();
    if (manual && (autoPath.length || tapTarget)) cancelAuto();
    if (player.moving) return;
    if (manual) {
      if (manual !== lastHeld) {
        lastHeld = manual;
        if (player.facing !== manual) { player.facing = manual; turnWait = TURN_FRAMES; return; }
        turnWait = 0;
      }
      if (turnWait > 0) { turnWait--; return; }
      tryStep(manual, input.isHeld('b'));
      return;
    }
    lastHeld = null;
    turnWait = 0;
    if (autoPath.length) {
      const d = autoPath[0];
      if (tryStep(d, false)) { autoPath.shift(); return; }
      // blocked (an NPC stepped in) → replan once, else give up
      const t = tapTarget;
      cancelAuto();
      if (t) planTap(t.x, t.y, true);
      return;
    }
    if (tapTarget && tapTarget.it) {
      const t = tapTarget;
      cancelAuto();
      player.facing = dirTo(player, t);
      void interactWith(t.it!);
    }
  }

  function onPlayerArrived(): void {
    if (!rm) return;
    syncSavePos();
    const x = player.x, y = player.y;
    const wp = rm.warps.get(key(x, y));
    if (wp) { cancelAuto(); void doWarp(wp); return; }
    for (const t of rm.def.triggers ?? []) {
      const w = t.w ?? 1, h = t.h ?? 1;
      if (x < t.x || y < t.y || x >= t.x + w || y >= t.y + h) continue;
      if (!evalFlag(t.if, G.save.data.flags)) continue;
      if (t.once && G.save.flag(t.once)) continue;
      if (t.once) G.save.setFlag(t.once, true);
      cancelAuto();
      void runScript(t.script, { x, y });
      return;
    }
    const seen = trainerSeeing(x, y);
    if (seen) { cancelAuto(); void trainerApproach(seen); return; }
    const info = infoAt(rm, x, y);
    if (info.grass && rm.def.area) {
      grassSteps++;
      if (Math.random() < ENCOUNTER_RATE || grassSteps >= ENCOUNTER_PITY) {
        grassSteps = 0;
        cancelAuto();
        void startWildBattle(rm.def.area);
        return;
      }
    }
  }

  function trainerSeeing(x: number, y: number): NpcRt | null {
    if (!rm) return null;
    for (const n of npcs) {
      if (!n.visible || !n.def.trainer || isDefeated(n.def.trainer) || n.ent.moving) continue;
      const sight = n.def.sight ?? 3;
      const [dx, dy] = DELTA[n.ent.facing];
      for (let i = 1; i <= sight; i++) {
        const tx = n.ent.x + dx * i, ty = n.ent.y + dy * i;
        if (tx === x && ty === y) return n;
        if (!inBounds(rm, tx, ty) || terrainBlocked(rm, tx, ty) || npcAt(tx, ty, n)) break;
      }
    }
    return null;
  }

  // ------------------------------------------------------------- npc logic
  function updateNpcs(): void {
    const paused = isLocked() || busy || !started;
    for (const n of npcs) {
      n.ent.tick();
      if (!n.visible || n.ent.moving || n.scripted > 0 || paused) continue;
      const mv = n.def.move ?? 'static';
      if (mv === 'static') continue;
      if (n.def.trainer && !isDefeated(n.def.trainer) && mv === 'wander') continue;
      if (--n.timer > 0) continue;
      n.timer = 60 + Math.floor(Math.random() * 120);
      const d = pick(DIRS as Dir[]);
      if (mv === 'turn') { n.ent.facing = d; continue; }
      const range = n.def.range ?? 2;
      const nx = n.ent.x + DELTA[d][0], ny = n.ent.y + DELTA[d][1];
      n.ent.facing = d;
      if (Math.abs(nx - n.ox) > range || Math.abs(ny - n.oy) > range) continue;
      if (blockedForNpc(nx, ny, n)) continue;
      n.ent.startMove(d, 1, 1, false);
    }
  }

  // ------------------------------------------------------------- transitions
  function loadMap(id: MapId, x: number, y: number, facing: Dir): void {
    const prev = rm ? mapId : null;
    const r = getRuntime(id);
    rm = r;
    mapId = id;
    npcs = r.def.npcs.map((d) => makeNpc(d, false));
    refreshItems();
    player.sprite = G.save?.data?.player?.appearance ?? null;
    player.setPos(Math.max(0, Math.min(r.w - 1, x)), Math.max(0, Math.min(r.h - 1, y)), facing);
    grassSteps = 0;
    cancelAuto();
    lastHeld = null;
    followerSpecies = -1;
    syncFollower();
    placeFollowerBehind();
    updateCamera();
    restoreMusic();
    if (prev !== id && (!r.def.indoor || r.def.name !== r.def.id)) {
      try { G.ui.hud.setMapName(r.def.name); } catch { /* ignore */ }
    }
    syncSavePos();
    try { G.save.write('map'); } catch { /* ignore */ }
    try { G.ui.hud.refresh(); } catch { /* ignore */ }
    ensureLoop();
  }

  async function transition(id: MapId, x: number, y: number, facing: Dir, fadeMs: number, sfxId?: 'door' | 'stairs'): Promise<void> {
    if (sfxId) sfx(sfxId);
    if (fadeMs > 0) await G.ui.fadeOut(fadeMs);
    loadMap(id, x, y, facing);
    render();
    if (fadeMs > 0) await G.ui.fadeIn(fadeMs);
    const onEnter = rm?.def.onEnter;
    if (onEnter) {
      if (scriptDepth > 0) void runScript(onEnter);
      else await runScript(onEnter);
    }
  }

  async function doWarp(wp: WarpDef): Promise<void> {
    if (busy || !rm) return;
    busy = true; lock();
    try {
      const target = getDef(wp.to);
      const here = tileAt(rm, wp.x, wp.y);
      const stairs = here === 'stairs_up' || here === 'stairs_down' || here === 'stairs_out';
      const s = wp.sfx ?? (stairs ? 'stairs' : 'door');
      const facing = wp.facing ?? (target.indoor ? 'up' : 'down');
      await transition(wp.to, wp.tx, wp.ty, facing, 220, s);
    } catch (e) {
      console.error('[world] warp failed', e);
    } finally {
      unlock(); busy = false;
    }
  }

  async function doExit(e: ExitDef, dir: Dir): Promise<void> {
    if (busy || !rm) return;
    busy = true; lock();
    try {
      const target = getRuntime(e.to);
      const vertical = dir === 'up' || dir === 'down';
      const c = (vertical ? player.x : player.y) + e.offset;
      let nx: number, ny: number;
      if (dir === 'up') { nx = c; ny = target.h - 1; }
      else if (dir === 'down') { nx = c; ny = 0; }
      else if (dir === 'left') { nx = target.w - 1; ny = c; }
      else { nx = 0; ny = c; }
      nx = Math.max(0, Math.min(target.w - 1, nx));
      ny = Math.max(0, Math.min(target.h - 1, ny));
      await transition(e.to, nx, ny, dir, 140);
    } catch (err) {
      console.error('[world] exit failed', err);
    } finally {
      unlock(); busy = false;
    }
  }

  // ------------------------------------------------------------ interaction
  function interactableFacing(): Interactable | null {
    if (!rm) return null;
    const [dx, dy] = DELTA[player.facing];
    const fx = player.x + dx, fy = player.y + dy;
    return interactableAt(fx, fy, dx, dy);
  }

  function interactableAt(fx: number, fy: number, dx: number, dy: number): Interactable | null {
    if (!rm) return null;
    const npc = npcAt(fx, fy);
    if (npc) return { kind: 'npc', npc };
    const item = itemAt(fx, fy);
    if (item) return { kind: 'item', item };
    const obj = rm.objects.get(key(fx, fy));
    if (obj) return { kind: 'object', obj };
    const sign = rm.signs.get(key(fx, fy));
    if (sign) return { kind: 'sign', sign };
    const info = infoAt(rm, fx, fy);
    if (info.counter && (dx || dy)) {
      const n2 = npcAt(fx + dx, fy + dy);
      if (n2) return { kind: 'npc', npc: n2 };
    }
    if (followerAt(fx, fy)) return { kind: 'follower' };
    if (info.water && rm.def.area && (G.save.data.bag.rod ?? 0) > 0) return { kind: 'fish' };
    return null;
  }

  /** Interactable at a tapped tile (no facing). */
  function interactableAtTile(tx: number, ty: number): Interactable | null {
    if (!rm) return null;
    const npc = npcAt(tx, ty);
    if (npc) return { kind: 'npc', npc };
    const item = itemAt(tx, ty);
    if (item) return { kind: 'item', item };
    const obj = rm.objects.get(key(tx, ty));
    if (obj) return { kind: 'object', obj };
    const sign = rm.signs.get(key(tx, ty));
    if (sign) return { kind: 'sign', sign };
    if (followerAt(tx, ty)) return { kind: 'follower' };
    const info = infoAt(rm, tx, ty);
    if (info.counter) {
      for (const d of DIRS) {
        const n2 = npcAt(tx + DELTA[d][0], ty + DELTA[d][1]);
        if (n2) return { kind: 'npc', npc: n2 };
      }
    }
    if (info.water && rm.def.area && (G.save.data.bag.rod ?? 0) > 0) return { kind: 'fish' };
    return null;
  }

  async function pressA(): Promise<void> {
    if (busy || isLocked() || !started || player.moving || !rm) return;
    const it = interactableFacing();
    if (!it) return;
    await interactWith(it);
  }

  async function interactWith(it: Interactable): Promise<void> {
    if (busy) return;
    busy = true; lock(); cancelAuto();
    try {
      switch (it.kind) {
        case 'npc': await talkNpc(it.npc); break;
        case 'item': await pickupItem(it.item); break;
        case 'sign': await G.ui.say(it.sign.text); break;
        case 'object':
          if (it.obj.script) await runScript(it.obj.script, { x: it.obj.x, y: it.obj.y });
          else if (it.obj.text?.length) await G.ui.say(it.obj.text);
          break;
        case 'follower': await talkFollower(); break;
        case 'fish': await fish(); break;
      }
    } catch (e) {
      console.error('[world] interaction failed', e);
    } finally {
      unlock(); busy = false;
    }
  }

  async function talkNpc(n: NpcRt): Promise<void> {
    n.ent.facing = dirTo(n.ent, player);
    const trainerId = n.def.trainer;
    if (trainerId && !isDefeated(trainerId)) { await battleTrainer(trainerId); return; }
    if (n.def.script) { await runScript(n.def.script, { npcId: n.def.id, x: n.ent.x, y: n.ent.y }); return; }
    if (trainerId) {
      const tr = G.data.trainers[trainerId];
      const lines = tr?.after?.length ? tr.after : n.def.text;
      if (lines?.length) await G.ui.say(lines, tr ? { speaker: tr.name } : undefined);
      return;
    }
    if (n.def.text?.length) await G.ui.say(n.def.text);
  }

  async function pickupItem(item: ItemBallDef): Promise<void> {
    G.save.setFlag(`item_${mapId}_${item.id}`, true);
    G.save.addItem(item.item, item.count);
    refreshItems();
    sfx('select');
    const name = itemName(item.item);
    const msg = item.count > 1 ? `${name} ${item.count}개를 주웠다!` : `${josa(name, '을/를')} 주웠다!`;
    await G.ui.say(msg);
    G.save.write('item');
  }

  async function talkFollower(): Promise<void> {
    const p = G.save.data.party[0];
    if (!p || !follower) return;
    const sp = G.data.speciesById(p.speciesId);
    const nm = p.nickname ?? sp.name;
    follower.facing = dirTo(follower, player);
    try { G.audio.playCry(p.speciesId); } catch { /* ignore */ }
    await emoteEnt(follower, '♥', 600);
    let lines: string[];
    if (p.maxHp > 0 && p.hp <= p.maxHp * 0.3) {
      lines = [`${josa(nm, '은/는')} 조금 지쳐 보인다…`, `${josa(nm, '이/가')} 포켓몬센터에 가고 싶어 하는 것 같다.`];
    } else {
      lines = [
        `${josa(nm, '이/가')} 기쁜 듯이 폴짝폴짝 뛰었다!`,
        `${josa(nm, '은/는')} 너를 가만히 바라보고 있다.`,
        `${josa(nm, '이/가')} 신나서 빙글빙글 돌았다!`,
        `${josa(nm, '은/는')} 같이 걷는 게 즐거운가 보다!`,
        `${josa(nm, '이/가')} 콧노래를 부르고 있다. ♪`,
        `${josa(nm, '이/가')} 너에게 딱 붙어 있다. 사이가 좋구나!`,
      ];
    }
    await G.ui.say(pick(lines));
  }

  async function fish(): Promise<void> {
    if (!rm || !rm.def.area) return;
    const area = rm.def.area;
    await G.ui.say('낚싯대를 물에 던졌다…', { auto: true });
    await wait(900);
    if (Math.random() < 0.65) {
      sfx('cursor');
      await emoteEnt(player, '!', 500);
      await G.ui.say('앗! 뭔가 걸렸다!');
      await wildBattle(area, { fishing: true });
    } else {
      await G.ui.say('아무것도 걸리지 않았다…');
    }
  }

  // ---------------------------------------------------------------- battles
  async function wildBattle(area: AreaId, opts: { fishing?: boolean } = {}): Promise<void> {
    const enc = rollEncounter(area, { fishing: opts.fishing });
    if (!enc) return;
    cancelAuto();
    sfx('encounter');
    await G.ui.flash('#ffffff', 110);
    await G.ui.flash('#ffffff', 110);
    const before = { map: mapId, x: player.x, y: player.y };
    try { G.ui.hud.setVisible(false); } catch { /* ignore */ }
    let outcome: BattleOutcome = 'fled';
    try {
      outcome = await G.battle.wild(enc.speciesId, enc.level, { area, fishing: !!opts.fishing, special: enc.special });
    } catch (e) {
      console.error('[world] battle.wild failed', e);
    }
    await afterBattle(outcome, before);
  }

  async function startWildBattle(area: AreaId, opts: { fishing?: boolean } = {}): Promise<void> {
    if (busy) return;
    busy = true; lock();
    try { await wildBattle(area, opts); }
    catch (e) { console.error(e); }
    finally { unlock(); busy = false; }
  }

  async function battleTrainer(trainerId: string): Promise<void> {
    const before = { map: mapId, x: player.x, y: player.y };
    try { G.ui.hud.setVisible(false); } catch { /* ignore */ }
    let outcome: BattleOutcome = 'won';
    try { outcome = await G.battle.trainer(trainerId); }
    catch (e) { console.error('[world] battle.trainer failed', e); }
    if (outcome === 'won' && !isDefeated(trainerId)) G.save.data.defeatedTrainers.push(trainerId);
    await afterBattle(outcome, before);
  }

  async function afterBattle(outcome: BattleOutcome, before: { map: MapId; x: number; y: number }): Promise<void> {
    try { G.ui.hud.setVisible(true); } catch { /* ignore */ }
    restoreMusic();
    const moved = before.map !== mapId || before.x !== player.x || before.y !== player.y;
    if (outcome === 'lost' && !moved) await whiteout();
    else if (outcome === 'won') { try { G.save.data.stats.battlesWon = (G.save.data.stats.battlesWon ?? 0) + 0; } catch { /* ignore */ } }
    syncFollower();
    try { G.save.write('battle'); } catch { /* ignore */ }
    try { G.ui.hud.refresh(); } catch { /* ignore */ }
  }

  async function trainerApproach(n: NpcRt): Promise<void> {
    if (busy || !rm) return;
    busy = true; lock();
    try {
      sfx('cursor');
      await emoteEnt(n.ent, '!', 700);
      const d = n.ent.facing;
      const [dx, dy] = DELTA[d];
      for (let guard = 0; guard < 8; guard++) {
        const nx = n.ent.x + dx, ny = n.ent.y + dy;
        if (nx === player.x && ny === player.y) break;
        if (terrainBlocked(rm, nx, ny) || npcAt(nx, ny, n) || itemAt(nx, ny)) break;
        n.scripted++;
        n.ent.startMove(d, 1, 1, false);
        await n.ent.waitArrive();
        n.scripted--;
      }
      n.ent.facing = dirTo(n.ent, player);
      player.facing = dirTo(player, n.ent);
      await battleTrainer(n.def.trainer!);
    } catch (e) {
      console.error('[world] trainer approach failed', e);
    } finally {
      unlock(); busy = false;
    }
  }

  async function whiteout(): Promise<void> {
    await G.ui.say(['힘이 다 빠져 버렸다…', '포켓몬센터로 돌아가서 푹 쉬자!']);
    const lh = G.save.data.lastHeal;
    await transition(lh.map, lh.x, lh.y, 'down', 400);
    healParty();
    try { G.ui.toast('포켓몬들이 모두 건강해졌어요!'); } catch { /* ignore */ }
    try { G.save.write('whiteout'); } catch { /* ignore */ }
  }

  function healParty(): void {
    for (const p of G.save.data.party) p.hp = p.maxHp;
  }

  // -------------------------------------------------------------- emotes
  async function emoteEnt(ent: Entity, e: string, ms: number): Promise<void> {
    ent.emote = { e, until: performance.now() + ms };
    await wait(ms);
  }

  // ---------------------------------------------------------------- scripts
  async function runScript(id: ScriptId, ctx: Partial<ScriptContext> = {}): Promise<void> {
    const fn = SCRIPTS[id];
    if (!fn) { console.warn(`[world] script not found: '${id}'`); return; }
    lock(); scriptDepth++; cancelAuto();
    try {
      await fn(G, { mapId, ...ctx });
    } catch (e) {
      console.error(`[world] script '${id}' failed`, e);
    } finally {
      scriptDepth--; unlock();
      refreshNpcs();
      try { G.ui.hud.refresh(); } catch { /* ignore */ }
      try { G.save.write('script'); } catch { /* ignore */ }
    }
  }

  function lock(): void { lockCount++; cancelAuto(); }
  function unlock(): void { lockCount = Math.max(0, lockCount - 1); }

  function wait(ms: number): Promise<void> {
    const t = testHooks();
    if (t?.fastText) ms = Math.min(ms, 30);
    return sleep(ms);
  }

  // ------------------------------------------------------------- tap-to-walk
  function planTap(tx: number, ty: number, replan = false): void {
    if (!rm || !inBounds(rm, tx, ty)) return;
    if (!replan && tx === player.x && ty === player.y) return;
    const it = interactableAtTile(tx, ty);
    if (it) {
      const cands: Pt[] = [];
      for (const d of DIRS) {
        const sx = tx + DELTA[d][0], sy = ty + DELTA[d][1];
        if (inBounds(rm, sx, sy) && passableForPath(sx, sy)) cands.push({ x: sx, y: sy });
        // across a counter
        if (inBounds(rm, sx, sy) && infoAt(rm, sx, sy).counter) {
          const cx = tx + DELTA[d][0] * 2, cy = ty + DELTA[d][1] * 2;
          if (inBounds(rm, cx, cy) && passableForPath(cx, cy)) cands.push({ x: cx, y: cy });
        }
      }
      if (it.kind === 'npc') {
        // if the NPC is behind a counter, the tapped tile is the NPC itself: add counter-side tiles
        const n = it.npc;
        for (const d of DIRS) {
          const cx = n.ent.x + DELTA[d][0], cy = n.ent.y + DELTA[d][1];
          if (inBounds(rm, cx, cy) && infoAt(rm, cx, cy).counter) {
            const sx = n.ent.x + DELTA[d][0] * 2, sy = n.ent.y + DELTA[d][1] * 2;
            if (inBounds(rm, sx, sy) && passableForPath(sx, sy)) cands.push({ x: sx, y: sy });
          }
        }
      }
      const path = findPathToAny(passableForPath, { x: player.x, y: player.y }, cands, TAP_MAX_STEPS);
      if (!path) return;
      autoPath = path;
      tapTarget = { x: it.kind === 'npc' ? it.npc.ent.x : tx, y: it.kind === 'npc' ? it.npc.ent.y : ty, it };
      if (!path.length) {
        cancelAuto();
        player.facing = dirTo(player, { x: tx, y: ty });
        void interactWith(it);
      }
      return;
    }
    if (!passableForPath(tx, ty)) return;
    const path = findPath(passableForPath, { x: player.x, y: player.y }, { x: tx, y: ty }, TAP_MAX_STEPS);
    if (!path) return;
    autoPath = path;
    tapTarget = { x: tx, y: ty, it: null };
  }

  function onCanvasPointer(e: PointerEvent): void {
    if (!started || isLocked() || busy || !rm) return;
    e.preventDefault();
    const l = layout.toLogical(e.clientX, e.clientY);
    const tx = Math.floor((camX + l.x) / TILE);
    const ty = Math.floor((camY + l.y) / TILE);
    planTap(tx, ty);
  }

  // ------------------------------------------------------------------- loop
  function updateCamera(): void {
    const v = layout.current;
    const p = player.pixel();
    camX = Math.round(p.px + TILE / 2 - v.w / 2);
    camY = Math.round(p.py + TILE / 2 - v.h / 2);
  }

  function update(): void {
    frame = Math.floor((performance.now() - t0) / 250);
    if (!rm) return;
    player.sprite = G.save?.data?.player?.appearance ?? player.sprite;
    syncFollower();
    if (started && !isLocked() && !busy) handlePlayerInput();
    const arrived = player.tick();
    if (arrived && scriptedMoves === 0 && !busy) onPlayerArrived();
    updateFollower();
    updateNpcs();
    const now = performance.now();
    if (player.emote && player.emote.until < now) player.emote = null;
    if (follower?.emote && follower.emote.until < now) follower.emote = null;
    for (const n of npcs) if (n.ent.emote && n.ent.emote.until < now) n.ent.emote = null;
  }

  function render(): void {
    if (!canvas) return;
    if (!renderer) {
      try { renderer = new Renderer(canvas); } catch (e) { console.error(e); return; }
    }
    if (!iconsLoaded && G.data?.atlas?.icons?.url) {
      iconsLoaded = true;
      renderer.loadIcons(G.data.atlas.icons.url, G.data.atlas.icons.cell, G.data.atlas.icons.cols);
    }
    const v = layout.current;
    if (!rm) {
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, v.w, v.h); }
      return;
    }
    updateCamera();
    const chars = npcs.map((n) => ({ ent: n.ent, order: 1 }));
    chars.push({ ent: player, order: 2 });
    renderer.draw({
      rm, camX, camY, frame, viewW: v.w, viewH: v.h, chars,
      items: items.map((it) => ({ x: it.x, y: it.y })),
      follower: follower && followerSpecies > 0 ? { ent: follower, speciesId: followerSpecies } : null,
    });
  }

  function tick(now: number): void {
    const dt = Math.min(120, now - last);
    last = now;
    acc += dt;
    let steps = 0;
    while (acc >= STEP_MS && steps < 4) { acc -= STEP_MS; steps++; try { update(); } catch (e) { console.error('[world] update error', e); } }
    if (acc > STEP_MS * 4) acc = 0;
    try { render(); } catch (e) { console.error('[world] render error', e); }
    requestAnimationFrame(tick);
  }

  function ensureLoop(): void {
    if (loopRunning) return;
    loopRunning = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }

  // --------------------------------------------------------------- wiring
  input.subscribe((ev) => {
    if (ev.type !== 'down') return false;
    if (!started || isLocked() || busy) return false;
    if (ev.button === 'a') { void pressA(); return true; }
    if (ev.button === 'start') { void openMenu(); return true; }
    return false;
  });
  canvas?.addEventListener('pointerdown', onCanvasPointer);

  async function openMenu(): Promise<void> {
    if (busy || isLocked() || !started) return;
    busy = true; lock();
    try { await G.ui.openStartMenu(); }
    catch (e) { console.error(e); }
    finally {
      unlock(); busy = false;
      syncFollower();
      try { G.ui.hud.refresh(); } catch { /* ignore */ }
      try { G.save.write('menu'); } catch { /* ignore */ }
    }
  }

  async function openDailyPlan(): Promise<void> {
    if (busy || isLocked() || !started) return;
    busy = true; lock();
    try { await G.ui.openDailyPlan(); }
    catch (e) { console.error(e); }
    finally {
      unlock(); busy = false;
      try { G.ui.hud.refresh(); } catch { /* ignore */ }
    }
  }

  // ---------------------------------------------------------------- service
  const world: WorldServiceExt = {
    get mapId() { return mapId; },
    get started() { return started; },

    async warp(id, x, y, facing = 'down', opts = {}) {
      const fade = opts.fade ?? !!rm;
      await transition(id, x, y, facing, fade ? 220 : 0, opts.sfx);
    },

    async teleport(id, x, y, facing = 'down') {
      await transition(id, x, y, facing, 0);
    },

    start() {
      started = true;
      if (!rm) {
        const p = G.save.data.pos;
        loadMap(p.map, p.x, p.y, p.facing);
      }
      try { G.ui.hud.setVisible(true); G.ui.hud.refresh(); } catch { /* ignore */ }
      ensureLoop();
    },

    lock, unlock, isLocked,
    runScript,

    async movePlayer(path, opts = {}) {
      if (!rm) return;
      ensureLoop();
      const speed = opts.speed ?? 1;
      scriptedMoves++;
      try {
        for (const d of path) {
          const [dx, dy] = DELTA[d];
          const nx = player.x + dx, ny = player.y + dy;
          const hop = d === 'down' && infoAt(rm, nx, ny).ledge === 'down';
          playerStep(d, hop ? 2 : 1, speed, hop);
          if (hop) sfx('ledge');
          await player.waitArrive();
        }
      } finally {
        scriptedMoves--;
        syncSavePos();
      }
    },

    async moveNpc(npcId, path, opts = {}) {
      const n = findNpc(npcId);
      if (!n) { console.warn(`[world] moveNpc: no npc '${npcId}'`); return; }
      ensureLoop();
      const speed = opts.speed ?? 1;
      n.scripted++;
      try {
        for (const d of path) { n.ent.startMove(d, 1, speed, false); await n.ent.waitArrive(); }
      } finally {
        n.scripted--;
      }
    },

    faceNpc(npcId, dir) {
      const n = findNpc(npcId);
      if (!n) return;
      n.ent.facing = dir === 'player' ? dirTo(n.ent, player) : dir;
    },

    facePlayer(dir) { player.facing = dir; syncSavePos(); },

    setNpcVisible(npcId, visible) {
      const n = findNpc(npcId);
      if (!n) return;
      n.forced = visible; n.visible = visible; n.ent.visible = visible;
    },

    spawnNpc(def) {
      npcs = npcs.filter((n) => n.def.id !== def.id);
      const n = makeNpc(def, true);
      if (n.forced === undefined && !def.visibleIf) n.visible = true;
      n.ent.visible = n.visible;
      npcs.push(n);
    },

    removeNpc(npcId) { npcs = npcs.filter((n) => n.def.id !== npcId); },

    getPlayerPos() { return { x: player.x, y: player.y, facing: player.facing }; },

    wait,

    async emote(target, e) {
      const ent = entOf(target);
      if (!ent) { await wait(300); return; }
      await emoteEnt(ent, e, 700);
    },

    refreshNpcs,
    refreshItems,
    healParty,

    registerMap(def) { overrides.set(def.id, def); cache.delete(def.id); },

    setLastHeal(pos) {
      if (pos) { G.save.data.lastHeal = { map: pos.map, x: pos.x, y: pos.y }; return; }
      const hs = rm?.def.healSpot;
      G.save.data.lastHeal = { map: mapId, x: hs?.x ?? player.x, y: hs?.y ?? player.y };
    },

    whiteout,
    startWildBattle,
    openMenu,
    openDailyPlan,
  };

  instance = world;
  return world;
}

/** Helper for story scripts: set the whiteout respawn point (nurse heal). */
export function setLastHeal(pos?: { map: MapId; x: number; y: number }): void {
  instance?.setLastHeal(pos);
}

export { evalFlag } from './flags';
export { encounterPool, rollEncounter, rollLevel, unlockedTier } from './encounters';
export { findPath, findPathToAny } from './path';
