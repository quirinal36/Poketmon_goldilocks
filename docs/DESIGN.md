# 포켓몬 공부 대모험 — Design Bible (single source of truth)

> Every agent working on this repo MUST read this file and `src/core/types.ts` first.
> If something here conflicts with code you find, this doc + types.ts win; flag the conflict in your final report.

## 0. Product summary

- **What**: A Pokémon-Gold-style (Game Boy Color look) top-down RPG for Korean **1st graders (초등 1학년)**, played in a **tablet browser** (iPad / Android tablet, touch first; keyboard also works).
- **Core loop**: walk in tall grass → wild Pokémon appears → **answer math/English questions** to battle it → answer the catch question to **catch it** → fill the **도감 (Pokédex, 251 species = Gen 1+2)**.
- **Curriculum**: math + English, progressing **1학년 1학기 → 1학년 2학기 → 2학년 1학기 → 2학년 2학기**. One lesson (차시) per subject per day by default ("매일 진도"), difficulty rising gradually.
- **Story scope**: 태초마을 (choose starter at 오박사's lab) → 1번도로 → 상록시티 → 2번도로 → 상록숲 → 회색시티 → 회색체육관: gym leader **웅** → **회색배지**. After the badge: free play continues (3번도로 opens, daily study continues, dex completion over ~2 years).
- **Customization**: player appearance (gender, skin, hair color, hair style, outfit color, hat), player name, rival name, partner Pokémon (party[0] follows you on the map, HGSS-style; changeable in the party screen), nicknames.
- **Deploy**: static site (Vite build, all paths relative, `base: './'`). Hosted on Vercel (full features incl. Supabase) and uploadable as ZIP to 렛츠코딩 라운지 (Lounge CSP blocks external fetch → game must work 100% offline from bundled data + localStorage).
- **Data**: questions/curriculum are data, not code. Source of truth = generator scripts in `scripts/questions/*.mjs` → `public/data/*.json` (bundled snapshot) → seeded into Supabase tables. At runtime the game uses Supabase when reachable (questions overrides + cloud save + answer logs) and silently falls back to bundled JSON + localStorage.

Child-friendliness rules (apply everywhere):
1. **Short Korean sentences**, 존댓말 for narration/questions ("~해 볼까요?", "~일까요?"), friendly 반말 for NPC dialogue is OK (like the games). Avoid hard Sino-Korean words. No scary/violent wording: use "지쳐버렸다" not "죽었다"; "눈앞이 캄캄해졌다" → use "힘이 빠져서 포켓몬센터로 돌아왔어요".
2. **Everything readable is also speakable**: question prompts auto-read with TTS (ko-KR); English content read with en-US voice; every dialog box has a 🔊 button.
3. **Touch targets ≥ 56 px** (CSS px) for answers, ≥ 48 px for other buttons. No hover-only UI. No double-tap requirements. No tiny text: min 18 px for body, 28 px+ for question text.
4. **Mistakes are safe**: wrong answer → gentle feedback + hint + retry. Never lose progress, money, or Pokémon. Losing a battle just sends you to the Pokémon Center with full HP.
5. Positive reinforcement: sounds, sparkles, "참 잘했어요!", EXP, level ups, evolutions.
6. No ads, no external links, no data collection beyond anonymous learning logs.

## 1. Tech stack & repo layout

- Vite 8 + TypeScript 7 (strict), **no UI framework**. Canvas 2D for the overworld; DOM (HTML/CSS) for dialogs, menus, battle, questions.
- `@supabase/supabase-js` (bundled via npm) — optional at runtime.
- Fonts (bundled in `public/fonts/`): `Galmuri11.woff2`, `Galmuri11-Bold.woff2` (Korean pixel font for game UI/dialog, OFL), `Jua.woff2` (rounded Korean font for question text & big buttons, OFL, subset to Hangul+ASCII).
- Tests: Vitest (`tests/unit/**/*.test.ts`), Playwright (`tests/e2e/**/*.spec.ts`, Chromium, tablet viewports).
- Images: Pokémon sprites from the Korean Pokémon wiki (pokemon.fandom.com/ko) packed into atlases; all other raster images generated with Codex image generation (`codex exec` image tool) and post-processed; tiles/characters are **procedural pixel art in code**.

```
index.html                 game entry
questions.html             teacher/parent "문제 미리보기" page (renders every question with the real renderer)
public/
  config.js                runtime config: window.__APP_CONFIG__ = { supabaseUrl, supabaseAnonKey } (empty = offline)
  fonts/                   woff2 fonts
  data/pokemon.json        Species[] (1..251)
  data/curriculum.json     { units: Unit[], lessons: Lesson[], version }
  data/questions/{m11,m12,m21,m22,e11,e12,e21,e22}.json   Question[] per subject+grade+semester
  assets/pokemon/front.png back.png icons.png atlas.json   sprite atlases
  assets/img/…             codex-generated images (trainers, title, badge, oak …) + manifest.json
src/
  main.ts                  boot
  game.ts                  the global Game registry object `G` (see §3)
  core/types.ts            ALL shared types/interfaces (contract)
  core/…                   loop, input, scene/overlay manager, save, events, rng, util
  art/…                    procedural pixel art: palette, tiles, structures, characters, icons
  world/…                  overworld: map runtime, renderer, player, npcs, follower, camera, pathfinding, encounters
  maps/…                   map definitions (MapDef) — one file per map + index.ts
  story/…                  scripts (async functions), trainers, flags, dialogue
  battle/…                 battle scene (DOM), battle math, exp/evolution
  learn/…                  bank (load questions), progress (daily pacing), picker, question view, visuals, tts
  ui/…                     dialog box, start menu, pokedex, party, bag, trainer card, customize, title, parent area, shop, pc, starter picker, toasts
  audio/…                  WebAudio chiptune music + sfx + procedural cries
  net/…                    Supabase client, anon auth, cloud save, answer log upload, question overrides
  styles/…                 CSS (global.css imported by main.ts; component CSS per module OK)
scripts/
  questions/math.mjs       exports buildMath(): { units, lessons, questions }
  questions/english.mjs    exports buildEnglish(): { units, lessons, questions }
  questions/lib.mjs        shared helpers: seeded rng, shuffle, id helpers, choice builders
  generate-questions.mjs   merges + validates → public/data/curriculum.json + questions/*.json
  validate-questions.mjs   schema validation (imported by generate)
  build-pokemon-data.mjs   PokeAPI → public/data/pokemon.json
  fetch-sprites.mjs        Korean wiki → atlases
  gen-images.mjs           codex image generation driver + post-processing
  seed-supabase.mjs        upsert curriculum/questions into Supabase (service role key from env)
  make-lounge-zip.mjs      dist/ → pokemon-study-lounge.zip (≤500 files, relative paths)
supabase/migrations/*.sql  schema + RLS + RPC
supabase/config.toml
tests/unit, tests/e2e
docs/DESIGN.md (this), docs/CURRICULUM.md, docs/DEPLOY.md, docs/TEACHER_GUIDE.md
```

## 2. Screen, layout & input

- Logical pixel art resolution: tile = **16 px**. Overworld viewport: **15 × 11 tiles (240 × 176)** in landscape, **11 × 13 tiles (176 × 208)** in portrait (choose by `innerWidth >= innerHeight`). Canvas scaled with nearest-neighbor (`image-rendering: pixelated`), integer scale when it fits, else fractional.
- DOM structure (index.html):
```html
<div id="app">
  <div id="stage">                      <!-- the "Game Boy screen"; aspect = viewport aspect -->
    <canvas id="world"></canvas>
    <div id="layer-hud"></div>          <!-- map name banner, top-right 📖 today pill, ☰ menu button -->
    <div id="layer-screen"></div>       <!-- full-stage DOM screens: battle, menus, dex, party … (one at a time, stackable) -->
    <div id="layer-dialog"></div>       <!-- GBC text box at the bottom of the stage -->
  </div>
  <div id="controls">…D-pad, A, B, START…</div>
  <div id="layer-modal"></div>          <!-- full-viewport: question card, parent gate, confirm dialogs -->
  <div id="layer-toast"></div>
  <div id="layer-fade"></div>           <!-- screen transitions -->
</div>
```
- Landscape: controls split left (D-pad) / right (A, B, START) around the stage. Portrait: stage on top, controls below. Stage is as large as possible.
- Inputs are unified into `InputButton = 'up'|'down'|'left'|'right'|'a'|'b'|'start'` events. Keyboard: arrows/WASD, Z/Space/Enter=A, X/Escape/Backspace=B, M/Tab=START. Touch: on-screen buttons (pointer events, multi-touch safe, hold-to-repeat for D-pad), plus **tap-to-walk** on the canvas (BFS path to tapped tile; tapping an NPC/sign/object walks next to it and interacts).
- When a DOM screen/dialog/modal is open, overworld movement is locked. DOM screens are touch-first (big buttons) but should also accept InputButton navigation where cheap (A=confirm, B=back).
- Text box ("dialog"): GBC style white box, 2 lines visible, typewriter effect (speed from settings), ▼ blinking indicator, **tap anywhere / A to advance**, 🔊 button reads current page (ko-KR TTS).

## 3. Runtime architecture — the `G` registry

`src/game.ts` exports a single mutable object `G: Game` (interface in types.ts). Modules register their implementation at boot in `main.ts`:
```ts
G.save = … ; G.ui = createUI(); G.world = createWorld(); G.battle = createBattle(); G.learn = createLearn(); G.audio = createAudio(); G.net = createNet(); G.data = loadedData;
```
Modules import `G` from `src/game.ts` and call each other **only through G's interfaces** (types.ts), never deep-importing another team's internals. This keeps parallel development decoupled.

Story/event scripts are plain `async (g: Game, ctx: ScriptContext) => void` functions that await UI/world/battle promises:
```ts
export const oak_lab_first: Script = async (g, ctx) => {
  await g.ui.say(['오, 왔구나!', '이 중에서 마음에 드는 포켓몬을 골라 보렴.'], { speaker: '오박사' });
  const speciesId = await g.ui.pickStarter(STARTERS);
  …
};
```
The world runs one script at a time (`g.world.runScript(id)`), locking input until it resolves.

## 4. Save data

- localStorage key `pokestudy.save.v1` (JSON of `SaveData`), plus `pokestudy.settings.v1` optional. Autosave: on map change, after every battle, after catching, after lesson completion, and on `visibilitychange` hidden. Manual "레포트 쓰기" in the start menu.
- `save.version` for migrations (`src/core/save.ts` must migrate/repair: fill missing fields with defaults).
- Cloud sync (if Supabase available): push debounced (≥ 20 s) + on hidden; pull on boot if cloud `updatedAt` is newer than local.

## 5. Learning system

### 5.1 Curriculum
- `Unit` and `Lesson` (types.ts). IDs: unit `m11-u1` (math, grade 1, semester 1, unit 1); lesson `m11-u1-l1`; question `m11-u1-l1-001`. English: `e11-…`. Lesson `order` is a global 1-based sequence **within its subject** across all 4 semesters.
- Each unit ends with a review lesson (`isReview: true`, title "○○ 복습") mixing the unit's question types.
- `requiredCorrect` default 8 (review lessons 10). A lesson is **completed** when the child has answered `requiredCorrect` questions from it correctly (cumulative, any days). Each completed lesson grants a **공부 도장 (study stamp)** and a small reward (₩200 + 몬스터볼 1).

### 5.2 Daily pacing ("매일 진도")
- `parent.pace` = max **new** lessons that may be started per subject per calendar day (local date). Default **1**. Options 1, 2, 3, 0 (=unlimited, for testing/fast learners).
- Each subject has a `current` lesson (first not-completed lesson by order). If today's started-count < pace, current is **active** (questions come from it). When it completes and the pace is exhausted, the next lesson is **locked until tomorrow** → questions come from review only. The child can always keep playing (review).
- "오늘의 공부" (daily plan) = today's active lesson for each enabled subject. When all enabled subjects' lessons for today are completed → 🎉 daily reward (₩500 + 몬스터볼 3 + a "오늘의 특별한 포켓몬" guaranteed encounter flag for the next grass encounter, tier ≤ unlocked+1).
- Parent can set start position (e.g. start at 1학년 2학기 lesson 1): all lessons before are marked completed (so review pool exists).

### 5.3 Question selection (picker)
Context `QuestionContext { purpose: 'wild'|'catch'|'trainer'|'gym'|'tutorial'|'practice'; subject?: Subject; }`.
- Subject: if not given, prefer the subject whose today-lesson is still incomplete; alternate otherwise; respect `parent.subjects` toggles.
- Source: 70% active lesson (if any), 30% review; review weighted by (wrong count × 3 + staleness), from completed lessons. `tutorial` = only difficulty 1 from the first lesson of the subject; `gym` = review of completed lessons, prefer the child's weak ones and unit-review lessons, difficulty ≥ 2 when available; `catch` = active or review, difficulty ≤ 3.
- Never repeat any of the last 12 question ids when alternatives exist.

### 5.4 Question schema
See `Question`, `Visual`, `Choice` in types.ts. Key rules for authors:
- `prompt`: ≤ 40 Korean chars, one instruction. e.g. "사과는 모두 몇 개일까요?", "그림에 알맞은 낱말을 골라 보세요."
- `answerMode: 'choice'` → 2–4 `choices`, exactly one correct (`answer` = choice id). Choice ids are `'a'|'b'|'c'|'d'`. Distractors must be plausible and **unambiguous**.
- `answerMode: 'numpad'` → `answer` is the integer as a string ("12"). Use for arithmetic with results 0–9999. Numpad has 0-9, ⌫, 확인.
- For English listening questions: put the English audio in `listen` ({text:'apple', lang:'en-US'}); the card shows a big 🔊 button and auto-plays it once after the prompt.
- `speak`: optional explicit TTS sequence for the prompt; default = `[{ text: prompt, lang: 'ko-KR' }]`. Use it to pronounce math symbols well: e.g. prompt "3 + 4 = □" → speak "3 더하기 4는 얼마일까요?".
- `hint`: shown after the first wrong attempt ("사과를 하나씩 세어 보세요."). `explain`: shown after the final answer ("3과 4를 모으면 7이에요.").
- Visuals are rendered by `src/learn/visuals.ts` (SVG/DOM). Emoji are used for pictures (Apple/Google emoji fonts on tablets).
- Difficulty 1–5 within a lesson (1 = first-day easy). Each lesson should have ≥ 20 questions spanning difficulties 1–3 (review lessons up to 4–5).

### 5.5 Question card UX (`askQuestion`)
- Full-viewport modal over a dimmed game. Header: subject chip (🔢 수학 / 🔤 영어) + lesson title; big prompt (Jua, 30–40 px); 🔊 button; visual; answers (2×2 grid of big buttons, or 1×N for text; numpad on the right/bottom).
- Auto-TTS on open (setting). For `listen` questions, auto-play the English audio after the prompt.
- Correct: green flash + ⭕ + "딩동댕!" sfx `correct` + short praise (random from list) → resolve after ~900 ms.
- Wrong (1st time): gentle shake + ✖ on that button (button disabled) + `wrong` sfx + hint → child tries again. Wrong (2nd time): reveal correct answer highlighted + explain + "다음에는 꼭 맞힐 수 있어요!" → [확인] → resolve `correct:false`.
- Returns `{ correct, firstTry, attempts, elapsedMs, questionId }`; it also calls `G.learn.record(...)` itself (single place of truth for stats).

## 6. Battle system

- DOM overlay in `#layer-screen`, GBC Gold layout: enemy sprite top-right (front sprite, 56×56 scaled ×(stage scale)), enemy name/level/HP box top-left; player Pokémon back sprite bottom-left, player HP/EXP box bottom-right; message box bottom. Background: white with soft pastel ground ellipses (grass/forest/gym tint by area).
- Intro: wild → "앗! 야생의 ○○(이)가 나타났다!" (use correct Korean particle via `josa()` util); trainer → trainer image slides in, "○○이(가) 승부를 걸어왔다!", then sends out Pokémon.
- Command menu (2×2 big buttons): **싸운다** (answer a question → attack) · **몬스터볼** (wild only) · **가방** (상처약) · **도망간다** (wild only; always succeeds). Also **포켓몬** (switch) accessible from 가방 row or as 5th small button — keep it simple: switch prompt only appears when the active Pokémon faints.
- Turn: 싸운다 → `askQuestion` (purpose wild/trainer/gym). Correct → player's Pokémon uses its type move (e.g. 피카츄 → "전기쇼크"), hit animation, enemy HP −(35–50% of enemy max, +10% if first try, type effectiveness text optional) and EXP gain (+5 + enemy level) per correct answer. Wrong → enemy attacks: player HP −(12–18% of max). Never more than one enemy attack per question.
- Catch: 몬스터볼 (needs ≥1 ball) → "catch" question. Correct → ball throw animation, 3 shakes; success chance = 1.0 if enemy HP ≤ 50%, else 0.6 (+0.2 if first try); wrong → ball bounces off: "앗, 몬스터볼이 빗나갔다!" (ball consumed only on correct throws). Success → "신난다! ○○을(를) 잡았다!", add to dex caught, offer nickname (예/아니오), goes to party if < 6 else box ("PC로 보냈어요"). Wild enemy fainting (HP 0) = won, EXP, and it's registered as seen (not caught) — so the child learns to throw a ball before HP is 0: when enemy HP ≤ 50% show a pulsing hint "지금 몬스터볼을 던져 보세요!".
- Player Pokémon fainting: "○○은(는) 지쳐버렸다!" → if others in party have HP, choose next (party picker), else "힘이 빠져서… 포켓몬센터로 돌아가자!" → warp to `lastHeal`, heal all, no penalty.
- Trainer battle: team of 1–2 Pokémon; after each enemy faints the next one comes out. Win → money reward + dialogue. Gym leader win → badge ceremony (badge image zoom + fanfare), flag set.
- Levels/EXP: `expToNext(L) = 20 + 6·L`; `maxHp(L) = 18 + 3·L`. Level-up → full HP restore of that Pokémon + jingle. After battle, check evolutions (`Species.evolvesTo[].level`); evolution sequence (flashing silhouettes ×3 → new sprite, "축하해요! ○○은(는) ○○(으)로 진화했다!"). Branching evolutions (e.g. 이브이) → let the child choose among options.
- Enemy level: area base range + small bonus from study stage. Wild HP uses the same `maxHp` formula.
- Type moves: map from primary type to a Korean move name (types.ts `TYPE_MOVES`).

## 7. World

### 7.1 Maps (see `MapDef` in types.ts)
Map ids and Korean names:
| id | name | kind | notes |
|---|---|---|---|
| `pallet` | 태초마을 | outdoor | player house, rival house, 오박사 연구소; north exit → route1; south: sea (fishing spot after rod) |
| `player_house_1f` | 우리 집 1층 | indoor | mom, TV, table, stairs up |
| `player_house_2f` | 우리 집 2층 | indoor | player's room: bed, PC (box), mirror (change looks), start position |
| `rival_house` | 라이벌의 집 | indoor | rival's sister (heals party: "푹 쉬렴") |
| `oak_lab` | 오박사 연구소 | indoor | oak, rival, assistant, table with 3 balls (starter picker) |
| `route1` | 1번도로 | outdoor | tall grass, ledges; area `route1` |
| `viridian` | 상록시티 | outdoor | 포켓몬센터, 프렌들리숍, 상록체육관 (closed), 트레이너 스쿨 (practice), exits S→route1, N→route2, W→route22 |
| `viridian_center` | 상록시티 포켓몬센터 | indoor | nurse (heal), PC, 오늘의 공부 board |
| `viridian_mart` | 상록시티 프렌들리숍 | indoor | clerk (shop) |
| `viridian_school` | 트레이너 스쿨 | indoor | teacher NPC: 연습 문제 (practice mode, no battle), blackboard |
| `route22` | 22번도로 | outdoor | tall grass, pond; fisherman gives 낚싯대 (flag `got_rod`); area `route22` (water fishing) |
| `route2` | 2번도로 | outdoor | tall grass; north → forest |
| `forest` | 상록숲 | outdoor(forest) | maze of trees, tall grass, 2 bug catcher trainers, items on ground; area `forest`; north exit → pewter |
| `pewter` | 회색시티 | outdoor | 포켓몬센터, 프렌들리숍, 회색체육관, museum (decor); east exit → route3 (blocked by NPC until badge) |
| `pewter_center` | 회색시티 포켓몬센터 | indoor | |
| `pewter_mart` | 회색시티 프렌들리숍 | indoor | |
| `pewter_gym` | 회색체육관 | indoor | gym guide (hint + stamp check), camper trainer, leader 웅 |
| `route3` | 3번도로 | outdoor | post-badge area `route3` (mountain/rough-terrain Pokémon) |

- Outdoor maps connect by **edge exits** (`MapDef.exits`): walking off the edge within the exit's range moves you to the neighbor map (short fade + name banner). Indoors connect by **warps** (door tiles, mats, stairs).
- Tall grass (`tall_grass` tile) triggers encounters: 10% per step, with a pity guarantee after 12 grass steps without one. Tiles with `water` + having `got_rod` + pressing A while facing water → fishing encounter (water species of that area).
- Ledges: one-way hop south (2-tile jump animation).
- `border` tile fills outside-of-map area on render (trees for routes, water for sea side).

### 7.2 Tiles (procedural pixel art, `src/art/tiles.ts`)
Every tile id below MUST exist (16×16). Flags in `TILE_INFO` (solid, grass, water, ledge, counter, animated). Autotile tiles receive a 4-bit neighbor mask (N=1,E=2,S=4,W=8 — bit set when neighbor is the same "family").

Outdoor: `grass` `grass2` `flower`(anim) `tall_grass` `path`(auto) `sand` `tree` `tree_dark` `bush` `water`(auto, anim) `ledge` `fence` `sign` `mailbox` `rock` `bridge` `stairs_out` `cave` `pond_lily` `black`
Indoor: `floor_wood` `floor_tile` `floor_lab` `floor_gym` `wall` `wall_window` `wall_poster` `wall_clock` `bookshelf` `pc` `tv` `bed_top` `bed_bottom` `table` `table_ball` `chair` `plant` `stairs_up` `stairs_down` `mat` `counter` `heal_machine` `lab_machine` `fridge` `sink` `mirror` `gym_statue` `gym_rock` `blackboard` `desk` `carpet` `black`

### 7.3 Structures (multi-tile buildings, `src/art/structures.ts`)
Placed on outdoor maps via `MapDef.structures`. Footprint tiles are solid except the door tile. Door = warp position (map author adds the warp at `x+door.x, y+door.y`).
| kind | w×h | door (dx,dy) | look |
|---|---|---|---|
| `house` | 4×3 | (1,2) | red roof, cream walls, window |
| `house_blue` | 4×3 | (1,2) | blue roof variant (rival house) |
| `lab` | 6×4 | (2,3) | big gray roof, white walls, "연구소" |
| `center` | 5×4 | (2,3) | red roof, "P.C" sign (포켓몬센터) |
| `mart` | 4×3 | (1,2) | blue roof, "SHOP" |
| `gym` | 6×5 | (2,4) | brown/stone, badge emblem, "GYM" |
| `school` | 5×4 | (2,3) | green roof, "SCHOOL" |
| `museum` | 6×4 | (2,3) | columns, decor only (no warp, door locked) |
| `gate` | 4×2 | (1,1) | forest gate hut (decor) |

### 7.4 Characters (`src/art/characters.ts`)
16×16 frames drawn at tile position (may overflow 4 px upward). 4 directions × 3 frames (stand, stepA, stepB). NPC sprite ids (`NpcSpriteId`): `mom` `oak` `rival` `sister` `aide` `nurse` `clerk` `teacher` `boy` `girl` `youngster` `lass` `oldman` `oldwoman` `bugcatcher` `camper` `leader_rock` `fisher` `hiker` `gymguide` `man` `woman` `scientist`. Player sprite built from `PlayerAppearance` with palette swaps (skin 3 tones, hair 6 colors, 3 hair styles per gender, outfit 6 colors, hat on/off). Also `drawPlayerPortrait(appearance, 'front'|'back', size 48)` for trainer card & battle intro (palette-swapped 48×48 pixel art).
Partner follower = the Pokémon's **icon** sprite (32×32 box icon from atlas, 2-frame bob animation via 1 px offset), drawn centered on its tile, bottom-aligned.

### 7.5 Encounters (`src/world/encounters.ts`)
Areas (`AreaId`): `route1` (grassland, urban), `route2` (grassland, forest), `forest` (forest), `route22` (grassland; water: waters-edge, sea), `route3` (mountain, rough-terrain, cave; water: waters-edge). Species have `tier` 1–9 and `habitats`.
- Tier unlock by **study stage** = total completed lessons (both subjects): tier ≤ 1 at stage 0, 2 @3, 3 @8, 4 @15, 5 @25, 6 @40, 7 @60, 8 @90. Tier 9 = legendary, only via events (semester completion rewards).
- Pool = species with a matching habitat, tier ≤ unlocked, and `obtainable === 'wild'`; weight = `(10 - tier)²`, ×0.5 if already caught (to favor new ones), ×1.5 for tier == unlocked (new stuff feels fresh).
- Every non-legendary species must be reachable in at least one area (data script guarantees via `habitats` fallback).
- Area base levels: route1 2–4, route2 3–5, forest 3–6, route22 4–7, route3 8–12; + floor(stage/10) capped +20.

### 7.6 Story flags & flow
Flags (string keys in `save.flags`): `intro_done`, `oak_called`(mom told you), `oak_stopped`(oak stopped you at route1), `got_starter`, `rival_lab_battle`, `got_dex`, `route1_tutorial`, `viridian_arrived`, `got_rod`, `forest_bug1`, `forest_bug2`, `pewter_arrived`, `gym_trainer1`, `badge_boulder`, `route3_open`, `daily_special`, plus per-item pickups `item_<map>_<id>`.
Flow:
1. Title → 새로 시작 → 오박사 intro (portrait image `oak`, shows a Pokémon sprite) → 성별 → 꾸미기 → 이름 → 라이벌 이름 → "자, 포켓몬 세계로 출발!" → `player_house_2f`.
2. 1층 엄마: "오박사님이 연구소로 오라고 하셨단다!" (`oak_called`).
3. Try to exit north into route1 grass without starter → 오박사 runs over: "잠깐! 풀숲에는 야생 포켓몬이 있어!" → walks you to the lab (`oak_stopped`).
4. Lab: rival is there. Oak explains: "문제를 풀면 포켓몬과 힘을 합칠 수 있단다." Interact with ball table → **starter picker**: 이상해씨(1) · 파이리(4) · 꼬부기(7) · 피카츄(25) · 치코리타(152) · 브케인(155) · 리아코(158). Confirm → nickname? → rival picks a counter (grass→fire starter of same gen, fire→water, water→grass, 피카츄→이브이(133), 치코리타→브케인, 브케인→리아코, 리아코→치코리타) → **rival battle** (tutorial questions, level 5 vs 5; kid can't really lose: if they faint, the rival says "좋은 승부였어!" and the story continues) → Oak gives **포켓몬 도감** + **몬스터볼 5개** (`got_dex`) + explains catching.
5. Route 1: first grass step → Oak's tip via 전화 message (dialog): catching tutorial (`route1_tutorial`).
6. Viridian: nurse heals; 오늘의 공부 board; 트레이너 스쿨 (practice); gym locked ("관장님은 외출 중"). Route 22: fisherman gives 낚싯대. Route 2 → forest (2 bug catchers; last one blocks the path until beaten? no—keep optional) → Pewter.
7. Pewter gym: gym guide explains: 웅에게 도전하려면 **공부 도장 4개** (completed lessons ≥ 4). If fewer: "도장 N/4개! 매일 공부해서 도장을 모아 오렴." Camper trainer (optional) → 웅 (team: 꼬마돌 Lv 8, 롱스톤 Lv 10; gym questions) → win → **회색배지** (`badge_boulder`), money ₩1000, route3 opens (`route3_open`), Oak congratulates via message. Post-game hint: "매일 공부하면 새로운 포켓몬이 나타나요!"

### 7.7 Trainers (`TrainerDef` in types.ts), ids
`rival_lab`, `bug_1` (벌레잡이 소년 민준: 캐터피 Lv4, 뿔충이 Lv4), `bug_2` (벌레잡이 소년 서준: 단데기 Lv5, 캐터피 Lv5, 뿔충이 Lv6→ keep ≤2 Pokémon: 단데기 Lv6, 딱충이 Lv6), `camper_gym` (캠프보이 도윤: 모래두지 Lv7), `leader_woong` (관장 웅: 꼬마돌 Lv8, 롱스톤 Lv10, badge `boulder`).

## 8. Images (codex) — `public/assets/img/`
Generated by `scripts/gen-images.mjs` via `codex exec` image tool, then post-processed (white bg → transparent, trim, nearest-neighbor resize). **Prompts must describe ORIGINAL characters and must NOT mention Pokémon/Nintendo/Game Freak or real franchise names** (the image moderation rejects them). Style keyword: "retro 16-bit color handheld RPG pixel art, clean black outlines, limited palette".
Required (file → use):
- `oak.png` professor portrait (elderly kind scientist, gray hair, white lab coat) — intro & lab.
- `rival.png` spiky-haired boy rival, confident smirk — battles.
- `bugcatcher.png`, `camper.png`, `leader_woong.png` (spiky dark brown hair, squinting smile, orange shirt, green vest, arms crossed), `mom.png` (optional).
- `badge_boulder.png` gray octagonal stone badge icon (128×128).
- `title_bg.png` landscape pixel art: sunrise over a small village with green hills and a path (no people, no text).
- `app_icon.png` 512×512: red-and-white ball on an open schoolbook, pixel art.
- `stamp.png` 공부 도장 icon (cute star stamp).
`public/assets/img/manifest.json` lists files and intended display size.

## 9. Audio
Exploration and battle background music uses four original instrumental recordings in `public/assets/audio/`; town, route, forest and battle themes are mapped to the existing MusicIds. The original chiptune remains as a load/decode fallback and for jingles, sound effects, and cries. See [AUDIO.md](AUDIO.md) for the recording source and mapping. Never copy Nintendo melodies. MusicId: `title` `town` `route` `forest` `city` `lab` `center` `gym` `battle_wild` `battle_trainer` `battle_gym` `victory` `caught` `levelup` `evolution` `heal` `badge`. SfxId: `select` `cursor` `back` `bump` `door` `stairs` `ledge` `grass` `encounter` `correct` `wrong` `hit` `hit_super` `faint` `ball_throw` `ball_shake` `ball_pop` `catch` `exp` `coin` `save` `stamp`. `playCry(speciesId)` = procedural short chirp seeded by id. Audio unlocks on first user gesture (iOS).

## 10. Supabase
Tables: `units`, `lessons`, `questions` (public read, `is_active`), `players` (owner rw via `auth.uid()`; `save jsonb`, `transfer_code`), `answer_logs` (owner insert/select). RPC `claim_transfer_code(code text) returns jsonb` (security definer). Anonymous sign-in. Client never needs the service key. Runtime config from `public/config.js`; empty → offline mode. All network calls are fire-and-forget with timeouts (≤ 4 s) and never block gameplay.

## 11. Parent/teacher area (보호자 메뉴)
Title screen button and start menu item "보호자". Gate: a random 2-digit × 1-digit multiplication typed on a numpad (e.g. "14 × 6 = ?"). Contents: 하루 진도량 (1/2/3/제한 없음), 과목 켜기/끄기, 시작 진도 설정 (학년·학기·단원 picker), 문제 읽어주기 on/off, 대사 읽어주기 on/off, 음악/효과음 volume, **학습 리포트** (per-unit accuracy bars, recent mistakes list with the question text, streak days, total correct), 이어하기 코드 (cloud) 만들기/입력, 저장 데이터 초기화 (double confirm), 문제 미리보기 링크 (`questions.html`).

## 12. Quality bar
- `npm run build` passes with zero TypeScript errors. `npm test` passes. E2E smoke passes on 1024×768 and 768×1024.
- No console errors during a normal playthrough. Works offline (no config) and online.
- 60 fps overworld on a mid tablet; no layout overflow at 1024×768, 768×1024, 1280×800, 820×1180, 375×667 (phone fallback).
- All Korean text proof-read: correct 조사 (use `josa()`), spacing, kid-appropriate.
