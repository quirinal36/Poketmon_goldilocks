// ============================================================================
// 포켓몬 공부 대모험 — shared contract types.
// Every module codes against these interfaces. Do not rename/remove fields
// without updating docs/DESIGN.md and every implementer. Additive optional
// fields are OK (document them in your report).
// ============================================================================

// ---------------------------------------------------------------- basics ----
export type Dir = 'up' | 'down' | 'left' | 'right';
export type InputButton = Dir | 'a' | 'b' | 'start';
export type Subject = 'math' | 'english';
export type Lang = 'ko-KR' | 'en-US';
export interface Speakable { text: string; lang: Lang }

// -------------------------------------------------------------- pokemon ----
/** Korean type keys (as shown in game). */
export type PokeType =
  | '노말' | '불꽃' | '물' | '풀' | '전기' | '얼음' | '격투' | '독' | '땅'
  | '비행' | '에스퍼' | '벌레' | '바위' | '고스트' | '드래곤' | '악' | '강철' | '페어리';

export type Habitat =
  | 'cave' | 'forest' | 'grassland' | 'mountain' | 'rare' | 'rough-terrain'
  | 'sea' | 'urban' | 'waters-edge';

export interface Species {
  id: number;               // national dex 1..251
  name: string;             // Korean name  (피카츄)
  nameEn: string;           // English name (Pikachu)
  types: PokeType[];        // 1 or 2
  genus: string;            // Korean 분류 e.g. '쥐포켓몬'
  flavor: string;           // Korean dex text (short, kid-readable if possible)
  height: number;           // meters
  weight: number;           // kg
  captureRate: number;      // 3..255
  tier: number;             // 1..9 rarity tier (9 = legendary/mythical, event only)
  habitats: Habitat[];      // where it appears in the wild (may be empty for evolved-only)
  obtainable: 'wild' | 'evolve' | 'event';  // how the child gets it
  evolvesFrom?: number;
  evolvesTo: { id: number; level: number }[];  // all evolutions normalized to a level
  isLegendary: boolean;
  isBaby: boolean;
  color: string;            // pokeapi color name (for UI tint)
}

export interface AtlasInfo {
  front: { url: string; cell: number; cols: number };   // 56px cells, index = id-1
  back: { url: string; cell: number; cols: number };    // 56px cells
  icons: { url: string; cell: number; cols: number };   // 32px cells
  count: number;                                        // 251
}

export interface PokemonInstance {
  uid: string;              // unique id
  speciesId: number;
  nickname?: string;
  level: number;
  exp: number;              // exp inside current level (0..expToNext(level)-1)
  hp: number;
  maxHp: number;
  caughtAt: string;         // ISO date
  caughtArea?: AreaId | 'starter' | 'event';
  friendship: number;       // 0..255, +1 per correct answer while in party lead
}

// ----------------------------------------------------------- curriculum ----
export interface Unit {
  id: string;               // 'm11-u1'
  subject: Subject;
  grade: 1 | 2;
  semester: 1 | 2;
  unitNo: number;
  title: string;            // '9까지의 수'
  description?: string;
  order: number;            // global order within subject (1-based)
}

export interface Lesson {
  id: string;               // 'm11-u1-l1'
  unitId: string;
  subject: Subject;
  grade: 1 | 2;
  semester: 1 | 2;
  lessonNo: number;         // within unit, 1-based
  title: string;            // '1부터 5까지 세기'
  goal: string;             // one-line learning goal (Korean)
  order: number;            // global 1-based sequence within subject across all semesters
  requiredCorrect: number;  // default 8, review 10
  isReview?: boolean;
}

export interface CurriculumData { version: string; units: Unit[]; lessons: Lesson[] }

// ------------------------------------------------------------- questions ----
export type ShapeKind =
  | 'circle' | 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon'
  | 'semicircle' | 'oval' | 'star' | 'heart' | 'diamond'
  // 3D (1학년 1학기 "여러 가지 모양"): box = 상자(직육면체) 모양, can = 둥근기둥 모양, ball = 공 모양
  | 'box' | 'can' | 'ball' | 'cube' | 'cone';

export interface CompareSide { number?: number; emoji?: string; count?: number; text?: string; label?: string }

export type Visual =
  /** Big text: "3 + 4 = □", "A", "c _ t", "It is a dog." */
  | { kind: 'text'; text: string; lang?: Lang; size?: 'md' | 'lg' | 'xl' }
  /** Single picture (emoji). caption optional under it. */
  | { kind: 'emoji'; emoji: string; size?: 'md' | 'lg' | 'xl'; caption?: string }
  /** N copies of an emoji to count. tenframe = 2×5 frames. */
  | { kind: 'count'; emoji: string; count: number; layout?: 'grid' | 'row' | 'tenframe' | 'scatter' }
  /** Groups with operator between: [🍎×3] + [🍎×2]; crossed = number crossed out (take-away subtraction). */
  | { kind: 'groups'; groups: { emoji: string; count: number; crossed?: number; label?: string }[]; op?: '+' | '-' | '×' | null }
  /** Two panels side by side to compare. */
  | { kind: 'compare'; left: CompareSide; right: CompareSide; prompt?: string }
  /** Analog clock. minute 0..59. */
  | { kind: 'clock'; hour: number; minute: number; showDigits?: boolean }
  /** Row of shapes (2D or 3D-ish). */
  | { kind: 'shapes'; items: { shape: ShapeKind; color?: string; label?: string; size?: number }[] }
  /** Pattern sequence; null = blank slot shown as "?" box. Items are emoji or short strings/numbers. */
  | { kind: 'pattern'; items: (string | null)[] }
  /** Base-ten blocks (hundreds flats, tens rods, ones cubes). thousands shown as big cubes. */
  | { kind: 'blocks'; thousands?: number; hundreds?: number; tens: number; ones: number }
  /** Number line. blank = position shown as "?" */
  | { kind: 'numberline'; from: number; to: number; step?: number; marks?: number[]; jumps?: { from: number; to: number }[]; blank?: number }
  /** Horizontal bars for length comparison (pencils/ribbons/snakes). length in arbitrary units or cm. */
  | { kind: 'lengths'; items: { label: string; length: number; color?: string; emoji?: string }[]; unit?: 'cm' | 'block' | null; showGrid?: boolean }
  /** Object on a ruler (cm). */
  | { kind: 'ruler'; lengthCm: number; startCm?: number; object?: 'pencil' | 'crayon' | 'ribbon' | 'key' | 'leaf' }
  /** Simple table. */
  | { kind: 'table'; headers: string[]; rows: (string | number)[][] }
  /** Bar graph or pictograph (symbol given → pictograph with that symbol per unit). */
  | { kind: 'bargraph'; title?: string; labels: string[]; values: number[]; max?: number; unitLabel?: string; symbol?: string }
  /** Scale/balance for weight comparison: heavier side goes down. */
  | { kind: 'balance'; left: { emoji: string; label?: string }; right: { emoji: string; label?: string }; heavier: 'left' | 'right' | 'equal' }
  /** Containers with water level for capacity comparison (level 0..1). */
  | { kind: 'containers'; items: { label: string; level: number; shape?: 'cup' | 'bottle' | 'bowl' | 'bucket' }[] }
  /** Areas for size comparison (rectangles with given w×h in grid units). */
  | { kind: 'areas'; items: { label: string; w: number; h: number; color?: string }[] }
  /** Calendar month grid (for 2-2 달력). highlight = day numbers. */
  | { kind: 'calendar'; year: number; month: number; highlight?: number[] }
  /** Multiplication table / addition table fragment with blanks (null = "?"). */
  | { kind: 'grid'; rows: (number | string | null)[][]; header?: boolean }
  /** Compose several visuals horizontally. */
  | { kind: 'row'; items: Visual[] };

export interface Choice {
  id: 'a' | 'b' | 'c' | 'd';
  text?: string;            // label text (Korean or English)
  emoji?: string;           // picture choice
  visual?: Visual;          // e.g. a clock or shape as a choice
  speak?: Speakable;        // tap 🔊 on the choice to hear it (English words)
}

export interface Question {
  id: string;               // 'm11-u1-l1-001'
  lessonId: string;
  subject: Subject;
  type: string;             // informational tag: 'count','add','sub','compare','clock','shape','pattern','place-value','listen-word','word-meaning','letter-case','initial-sound','missing-letter','sentence', …
  prompt: string;           // Korean instruction (≤ 40 chars)
  speak?: Speakable[];      // TTS for the prompt; default [{text: prompt, lang:'ko-KR'}]
  listen?: Speakable;       // English (or Korean) audio to listen to — big 🔊 button
  visual?: Visual;
  answerMode: 'choice' | 'numpad';
  choices?: Choice[];       // 2..4 for 'choice'
  shuffle?: boolean;        // default true (renderer shuffles choice display order)
  answer: string;           // choice id ('a'..'d') or integer string for numpad
  hint?: string;
  explain?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface QuestionContext {
  purpose: 'wild' | 'catch' | 'trainer' | 'gym' | 'tutorial' | 'practice';
  subject?: Subject;
  lessonId?: string;        // force a lesson (practice mode)
}

export interface AskOptions {
  purpose: QuestionContext['purpose'];
  title?: string;           // e.g. '야생의 구구와 대결!'
  allowRetry?: boolean;     // default true (2 attempts)
}

export interface AskResult {
  questionId: string;
  correct: boolean;         // final result (true if correct on 1st or 2nd try)
  firstTry: boolean;
  attempts: number;
  elapsedMs: number;
}

export interface AnswerLog {
  questionId: string; lessonId: string; subject: Subject;
  correct: boolean; firstTry: boolean; elapsedMs: number;
  purpose: QuestionContext['purpose']; at: string;   // ISO
}

export interface LessonStatus {
  subject: Subject;
  lesson: Lesson | null;         // current lesson (null = curriculum finished)
  state: 'active' | 'completed_today' | 'locked_until_tomorrow' | 'finished' | 'disabled';
  correct: number;               // correct answers counted toward this lesson
  required: number;
}

export interface DailyPlan {
  date: string;                  // YYYY-MM-DD (local)
  math: LessonStatus;
  english: LessonStatus;
  allDoneToday: boolean;
  rewardClaimed: boolean;
}

// ----------------------------------------------------------------- save ----
export interface PlayerAppearance {
  gender: 'boy' | 'girl';
  skin: number;       // 0..2
  hairColor: number;  // 0..5
  hairStyle: number;  // 0..2
  outfit: number;     // 0..5
  hat: boolean;
}

export type ItemId = 'pokeball' | 'greatball' | 'potion' | 'rod' | 'dex' | 'stamp_card';

export interface SubjectProgress {
  current: string | null;                                   // current lesson id
  completed: Record<string, { at: string; correct: number; total: number }>;
  lessonStats: Record<string, { c: number; w: number }>;    // counted answers per lesson
}

export interface ParentSettings {
  pace: 0 | 1 | 2 | 3;                  // 0 = unlimited
  subjects: { math: boolean; english: boolean };
  ttsQuestions: boolean;                // auto-read questions (default true)
  ttsDialog: boolean;                   // auto-read dialog (default false)
}

export interface LearnState {
  parent: ParentSettings;
  subjects: Record<Subject, SubjectProgress>;
  daily: {
    date: string;                                     // YYYY-MM-DD local
    startedLessons: Record<Subject, string[]>;        // lesson ids that became active today
    correct: Record<Subject, number>;
    answered: Record<Subject, number>;
    rewardClaimed: boolean;
  };
  qstats: Record<string, { c: number; w: number; last: number }>;   // per question id (last = epoch ms)
  recent: string[];                                                  // last question ids (max 30)
  mistakes: string[];                                                // recent wrong question ids (max 50)
  pendingLogs: AnswerLog[];                                          // not yet uploaded
  streak: { days: number; lastDate: string };
}

export interface Settings {
  music: number;      // 0..1
  sfx: number;        // 0..1
  textSpeed: 'slow' | 'normal' | 'fast';
  ttsRate: number;    // 0.7..1.2
}

export interface SaveData {
  version: 1;
  id: string;                     // local save uuid
  createdAt: string;
  updatedAt: string;
  playTimeSec: number;
  player: {
    name: string;
    rivalName: string;
    appearance: PlayerAppearance;
    money: number;
    badges: string[];             // 'boulder'
  };
  party: PokemonInstance[];       // ≤ 6; party[0] = partner (follows on map, leads battles)
  box: PokemonInstance[];
  dex: { seen: number[]; caught: number[] };
  bag: Partial<Record<ItemId, number>>;
  pos: { map: MapId; x: number; y: number; facing: Dir };
  lastHeal: { map: MapId; x: number; y: number };
  flags: Record<string, boolean | number | string>;
  defeatedTrainers: string[];
  learn: LearnState;
  settings: Settings;
  stats: { correct: number; wrong: number; battlesWon: number; caught: number; stampsTotal: number };
}

// ---------------------------------------------------------------- world ----
export type MapId =
  | 'pallet' | 'player_house_1f' | 'player_house_2f' | 'rival_house' | 'oak_lab'
  | 'route1' | 'viridian' | 'viridian_center' | 'viridian_mart' | 'viridian_school'
  | 'route22' | 'route2' | 'forest' | 'pewter' | 'pewter_center' | 'pewter_mart' | 'pewter_gym'
  | 'route3' | 'mt_moon_front' | 'mt_moon_deep' | 'route4'
  | 'cerulean' | 'cerulean_center' | 'cerulean_mart' | 'cerulean_gym'
  | 'route24' | 'route25' | 'bill_house' | 'route5' | 'underground_path' | 'route6'
  | 'vermilion' | 'vermilion_center' | 'vermilion_mart' | 'vermilion_gym'
  | 'ss_anne_1f' | 'ss_anne_deck' | 'ss_anne_captain'
  | 'route9' | 'route10_north' | 'rock_tunnel_1f' | 'rock_tunnel_b1f' | 'route10_south'
  | 'lavender' | 'lavender_center' | 'route8' | 'underground_path_west' | 'route7'
  | 'celadon' | 'celadon_center' | 'celadon_mart' | 'celadon_garden' | 'celadon_gym';

export type AreaId = 'route1' | 'route2' | 'forest' | 'route22' | 'route3' | 'mt_moon' | 'route4' | 'cerulean' | 'route24' | 'route25' | 'route5' | 'route6' | 'vermilion' | 'route9' | 'route10' | 'rock_tunnel' | 'lavender' | 'route8' | 'route7' | 'celadon' | 'celadon_garden';

export type TileId =
  // outdoor
  | 'grass' | 'grass2' | 'flower' | 'tall_grass' | 'path' | 'sand' | 'tree' | 'tree_dark' | 'bush'
  | 'water' | 'ledge' | 'fence' | 'sign' | 'mailbox' | 'rock' | 'bridge' | 'stairs_out' | 'cave'
  | 'pond_lily' | 'black' | 'cave_floor' | 'cave_wall'
  // indoor
  | 'floor_wood' | 'floor_tile' | 'floor_lab' | 'floor_gym' | 'wall' | 'wall_window' | 'wall_poster'
  | 'wall_clock' | 'bookshelf' | 'pc' | 'tv' | 'bed_top' | 'bed_bottom' | 'table' | 'table_ball'
  | 'chair' | 'plant' | 'stairs_up' | 'stairs_down' | 'mat' | 'counter' | 'heal_machine'
  | 'lab_machine' | 'fridge' | 'sink' | 'mirror' | 'gym_statue' | 'gym_rock' | 'blackboard' | 'desk'
  | 'carpet';

export interface TileInfo {
  solid: boolean;
  grass?: boolean;       // triggers encounters
  water?: boolean;       // fishing / impassable
  ledge?: Dir;           // one-way hop direction (always 'down' in this game)
  counter?: boolean;     // can talk across (nurse/clerk)
  animated?: boolean;
  autotile?: boolean;    // renderer passes neighbor mask
  family?: string;       // autotile family key (e.g. 'water', 'path')
}

export type StructureKind = 'house' | 'house_blue' | 'lab' | 'center' | 'mart' | 'gym' | 'school' | 'museum' | 'gate';
export interface StructureInfo { w: number; h: number; door: { x: number; y: number } | null }

export type NpcSpriteId =
  | 'mom' | 'oak' | 'rival' | 'sister' | 'aide' | 'nurse' | 'clerk' | 'teacher' | 'boy' | 'girl'
  | 'youngster' | 'lass' | 'oldman' | 'oldwoman' | 'bugcatcher' | 'camper' | 'leader_rock' | 'fisher'
  | 'hiker' | 'gymguide' | 'man' | 'woman' | 'scientist' | 'rocket' | 'clefairy' | 'leader_water' | 'leader_surge' | 'leader_erika';

export type ScriptId = string;
export type FlagExpr = string;   // 'flag' | '!flag' | 'flagA&flagB' | 'a|b' (see world/flags.ts evalFlag)

export interface NpcDef {
  id: string;
  x: number; y: number;
  sprite: NpcSpriteId;
  facing?: Dir;
  move?: 'static' | 'wander' | 'turn';   // wander within range; turn = random facing changes
  range?: number;                        // wander radius (default 2)
  text?: string[];                       // simple talk (used if no script)
  script?: ScriptId;                     // run on talk (A facing NPC)
  visibleIf?: FlagExpr;                  // hidden when false
  trainer?: string;                      // TrainerDef id: sight-line challenge unless defeated
  sight?: number;                        // tiles of sight for trainer (default 3)
}

export interface WarpDef { x: number; y: number; to: MapId; tx: number; ty: number; facing?: Dir; sfx?: 'door' | 'stairs' }
export interface ExitDef { dir: Dir; to: MapId; from?: number; toRange?: number; offset: number }
/** Edge exit: when the player walks off the map edge `dir`, at a coordinate c along that edge with
 *  from <= c < from+toRange (defaults: whole edge), they arrive in `to` at coordinate c+offset along
 *  the opposite edge (x for north/south, y for east/west). */

export interface SignDef { x: number; y: number; text: string[] }
export interface TriggerDef { x: number; y: number; w?: number; h?: number; script: ScriptId; if?: FlagExpr; once?: string /* flag set after first run */ }
export interface ItemBallDef { id: string; x: number; y: number; item: ItemId; count: number }

export interface MapDef {
  id: MapId;
  name: string;                       // Korean display name
  width: number; height: number;
  tiles: string[];                    // rows (length = height), each string length = width
  legend?: Record<string, TileId>;    // overrides/extends DEFAULT_LEGEND (maps/legend.ts)
  border: TileId;                     // tile drawn outside the map
  music: MusicId;
  indoor: boolean;
  area?: AreaId;                      // encounter area (tall grass + fishing)
  structures?: { kind: StructureKind; x: number; y: number }[];
  warps: WarpDef[];
  exits?: ExitDef[];
  npcs: NpcDef[];
  signs?: SignDef[];
  triggers?: TriggerDef[];
  items?: ItemBallDef[];              // pokeballs lying on the ground (pickup once)
  onEnter?: ScriptId;
  /** Where to respawn after whiteout if this map has a nurse (Pokémon Center). */
  healSpot?: { x: number; y: number };
  /** Objects you can interact with (bookshelf text, PC, TV, mirror, heal machine...). */
  objects?: { x: number; y: number; script?: ScriptId; text?: string[] }[];
}

export interface TrainerDef {
  id: string;
  name: string;                       // '웅'
  className: string;                  // '관장', '벌레잡이 소년', '라이벌'
  image: string;                      // codex image key without extension, e.g. 'leader_woong'
  team: { speciesId: number; level: number }[];
  intro: string[];
  defeat: string[];                   // said when you win
  after?: string[];                   // talk after defeat
  reward: number;                     // money
  purpose: 'trainer' | 'gym' | 'tutorial';
  music?: MusicId;
  badge?: string;                     // 'boulder'
}

export interface ScriptContext {
  mapId: MapId;
  npcId?: string;
  x?: number; y?: number;
}
export type Script = (g: Game, ctx: ScriptContext) => Promise<void>;

// ---------------------------------------------------------------- audio ----
export type MusicId =
  | 'title' | 'town' | 'route' | 'forest' | 'city' | 'lab' | 'center' | 'gym'
  | 'battle_wild' | 'battle_trainer' | 'battle_gym' | 'victory' | 'caught' | 'levelup'
  | 'evolution' | 'heal' | 'badge';
export type SfxId =
  | 'select' | 'cursor' | 'back' | 'bump' | 'door' | 'stairs' | 'ledge' | 'grass' | 'encounter'
  | 'correct' | 'wrong' | 'hit' | 'hit_super' | 'faint' | 'ball_throw' | 'ball_shake' | 'ball_pop'
  | 'catch' | 'exp' | 'coin' | 'save' | 'stamp';

// ------------------------------------------------------------- services ----
export interface SayOptions {
  speaker?: string;          // name shown in a small tab above the box ('오박사')
  portrait?: string;         // codex image key shown left of the box (optional)
  auto?: boolean;            // auto-advance (no tap) — for cutscenes, default false
}

export interface UIService {
  /** Show one or more pages in the bottom text box; resolves after the last page is dismissed. */
  say(lines: string | string[], opts?: SayOptions): Promise<void>;
  /** Text box + choice list (2..6 options). Resolves index. B/cancel returns cancelIndex if given, else ignored. */
  choose(prompt: string | string[], options: string[], opts?: SayOptions & { cancelIndex?: number }): Promise<number>;
  yesNo(prompt: string | string[], opts?: SayOptions): Promise<boolean>;
  toast(msg: string, ms?: number): void;
  fadeOut(ms?: number): Promise<void>;
  fadeIn(ms?: number): Promise<void>;
  flash(color?: string, ms?: number): Promise<void>;
  /** Screens (DOM, in #layer-screen). Each resolves when closed. */
  openStartMenu(): Promise<void>;
  openPokedex(focusId?: number): Promise<void>;
  openParty(mode?: 'view' | 'choose'): Promise<number | null>;   // choose → party index
  openBag(mode?: 'view' | 'battle'): Promise<ItemId | null>;
  openTrainerCard(): Promise<void>;
  openDailyPlan(): Promise<void>;
  openCustomize(mode: 'intro' | 'mirror'): Promise<PlayerAppearance>;
  openNameEntry(title: string, suggestions: string[], initial?: string, maxLen?: number): Promise<string>;
  openParentArea(): Promise<void>;
  openShop(items: { item: ItemId; price: number }[]): Promise<void>;
  openPC(): Promise<void>;
  pickStarter(options: number[]): Promise<number>;               // species id
  pickEvolution(options: number[]): Promise<number>;             // branching evolution choice
  showBadge(badgeId: string): Promise<void>;
  showTitle(): Promise<'new' | 'continue'>;
  hud: { setMapName(name: string): void; refresh(): void; setVisible(v: boolean): void };
}

export interface WorldService {
  readonly mapId: MapId;
  /** Load a map and place the player. Plays music, shows banner, runs onEnter. */
  warp(mapId: MapId, x: number, y: number, facing?: Dir, opts?: { fade?: boolean; sfx?: 'door' | 'stairs' }): Promise<void>;
  /** Start the overworld loop (after title/intro). */
  start(): void;
  /** Pause/resume map input and NPC movement (scripts & screens call these). */
  lock(): void;
  unlock(): void;
  runScript(id: ScriptId, ctx?: Partial<ScriptContext>): Promise<void>;
  movePlayer(path: Dir[], opts?: { speed?: number }): Promise<void>;
  moveNpc(npcId: string, path: Dir[], opts?: { speed?: number }): Promise<void>;
  faceNpc(npcId: string, dir: Dir | 'player'): void;
  facePlayer(dir: Dir): void;
  setNpcVisible(npcId: string, visible: boolean): void;
  /** Spawn a temporary NPC (e.g. Oak running in). Removed on map change. */
  spawnNpc(def: NpcDef): void;
  removeNpc(npcId: string): void;
  getPlayerPos(): { x: number; y: number; facing: Dir };
  wait(ms: number): Promise<void>;
  /** Screen shake / emote bubble above an npc or 'player' ('!' '?' '♪' '♥'). */
  emote(target: string | 'player', emote: '!' | '?' | '♪' | '♥' | '…'): Promise<void>;
  refreshNpcs(): void;        // re-evaluate visibleIf after flag changes
  healParty(): void;
  setLastHeal(pos?: { map: MapId; x: number; y: number }): void;
  whiteout(): Promise<void>;
}

export type BattleOutcome = 'won' | 'lost' | 'caught' | 'fled';

export interface BattleService {
  wild(speciesId: number, level: number, opts?: { area?: AreaId; fishing?: boolean; special?: boolean }): Promise<BattleOutcome>;
  trainer(trainerId: string): Promise<BattleOutcome>;
  /** Give EXP to a party member outside battle (e.g. practice) and run level-up/evolution UI. */
  giveExp(partyIndex: number, amount: number): Promise<void>;
  /** Check evolutions for the whole party (after battle) and play sequences. */
  checkEvolutions(): Promise<void>;
}

export interface LearnService {
  init(): Promise<void>;
  curriculum(): CurriculumData;
  lesson(id: string): Lesson | undefined;
  unit(id: string): Unit | undefined;
  /** Pick the next question for a context (loads question files lazily). */
  next(ctx: QuestionContext): Promise<Question>;
  /** Show the question card and resolve with the result (records it). */
  ask(q: Question, opts: AskOptions): Promise<AskResult>;
  /** Convenience: next() + ask(). */
  quiz(ctx: QuestionContext, opts?: Partial<AskOptions>): Promise<AskResult>;
  record(q: Question, result: AskResult, purpose: QuestionContext['purpose']): void;
  plan(): DailyPlan;
  /** Total completed lessons (both subjects) = study stage & number of 공부 도장. */
  stage(): number;
  /** Apply daily rollover if the date changed (call on boot & resume). */
  rollover(): void;
  /** Parent: set start point — marks all lessons before `lessonOrder` of that subject completed. */
  setStart(subject: Subject, lessonOrder: number): void;
  /** Listeners: lesson completed (stamp), daily plan complete. */
  on(ev: 'lessonComplete' | 'dailyComplete', cb: (payload: any) => void): () => void;
  questionsForLesson(lessonId: string): Promise<Question[]>;
}

export interface AudioService {
  unlock(): void;
  playMusic(id: MusicId | null): void;
  playSfx(id: SfxId): void;
  playCry(speciesId: number): void;
  /** Play a short jingle and resolve when it ends (victory, caught, levelup, heal, badge, evolution). */
  jingle(id: MusicId): Promise<void>;
  setVolumes(music: number, sfx: number): void;
  speak(items: Speakable | Speakable[], opts?: { rate?: number; interrupt?: boolean }): Promise<void>;
  stopSpeaking(): void;
  ttsAvailable(lang: Lang): boolean;
}

export interface NetService {
  readonly loginAvailable: boolean;
  readonly accountId: string | null;
  readonly accountName: string | null;
  readonly authError: string | null;
  signInWithPassword(email: string, password: string): Promise<string | null>;
  signInWithKakao(): Promise<string | null>;
  signOut(): Promise<boolean>;
  readonly online: boolean;
  init(): Promise<void>;
  pullSave(): Promise<SaveData | null>;
  flush(): Promise<boolean>;                    // true = cloud save confirmed
  pushSave(save: SaveData): void;                 // debounced, fire-and-forget
  flushLogs(logs: AnswerLog[]): Promise<boolean>; // true = uploaded
  fetchQuestions(lessonIds: string[]): Promise<Question[] | null>;
  fetchCurriculum(): Promise<CurriculumData | null>;
  createTransferCode(): Promise<string | null>;
  claimTransferCode(code: string): Promise<SaveData | null>;
}

export interface SaveService {
  data: SaveData;
  exists(): boolean;
  newGame(): SaveData;
  load(): SaveData | null;
  write(reason?: string): boolean;          // persist to localStorage (+ net.pushSave)
  reset(): void;
  flag(key: string): boolean;
  setFlag(key: string, value?: boolean | number | string): void;
  addItem(item: ItemId, n?: number): void;
  useItem(item: ItemId, n?: number): boolean;
  addMoney(n: number): void;
  addPokemon(p: PokemonInstance): 'party' | 'box';
  markSeen(speciesId: number): void;
  markCaught(speciesId: number): void;
}

export interface GameData {
  species: Species[];                   // index 0 = id 1
  speciesById(id: number): Species;
  atlas: AtlasInfo;
  images: Record<string, string>;       // codex image key → url
  trainers: Record<string, TrainerDef>;
}

export interface Game {
  data: GameData;
  save: SaveService;
  ui: UIService;
  world: WorldService;
  battle: BattleService;
  learn: LearnService;
  audio: AudioService;
  net: NetService;
  /** Debug/test hooks enabled with ?debug=1 */
  debug: boolean;
}

// ------------------------------------------------------------- constants ----
export const TILE = 16;

export const TYPE_MOVES: Record<PokeType, string> = {
  노말: '몸통박치기', 불꽃: '불꽃세례', 물: '물대포', 풀: '덩굴채찍', 전기: '전기쇼크', 얼음: '얼다바람',
  격투: '태권당수', 독: '독침', 땅: '진흙뿌리기', 비행: '날개치기', 에스퍼: '염동력', 벌레: '벌레먹음',
  바위: '돌떨구기', 고스트: '핥기', 드래곤: '용의숨결', 악: '물기', 강철: '메탈크로우', 페어리: '요정의바람',
};

export const STARTERS = [1, 4, 7, 25, 152, 155, 158];

export const expToNext = (level: number): number => 20 + 6 * level;
export const maxHpFor = (level: number): number => 18 + 3 * level;
