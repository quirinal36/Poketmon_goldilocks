# 포켓몬 데이터 (POKEMON_DATA)

Generated sections below are (re)written by `scripts/build-pokemon-data.mjs` (data) and
`scripts/fetch-sprites.mjs` (sprites). Edit the scripts, not the generated blocks.

<!-- BEGIN:data -->
## 데이터: public/data/pokemon.json

Source: PokeAPI (`pokemon-species`, `pokemon`, `evolution-chain`), cached in `.cache/pokeapi/`.
Regenerate with `npm run data:pokemon` (`-- --refresh` re-downloads). Output = `Species[]` (types.ts), index 0 = id 1.
Built 2026-09-30.

### Field rules
- `name` / `genus` / `flavor`: Korean (`ko`) PokeAPI entries. `nameEn`: English name.
- `types`: current types (e.g. 삐삐 = 페어리), keys: normal→노말, fire→불꽃, water→물, grass→풀, electric→전기, ice→얼음, fighting→격투, poison→독, ground→땅, flying→비행, psychic→에스퍼, bug→벌레, rock→바위, ghost→고스트, dragon→드래곤, dark→악, steel→강철, fairy→페어리.
- `flavor`: the **shortest** Korean dex entry (whitespace normalized). Entries containing "죽", "살해", "피를", "목숨", "시체", "잡아먹", "지옥", "저주", "사별", "영혼", "갈기갈기", "태워버", "불태워", "파괴", "기절" are skipped when another entry exists.
- `height` m, `weight` kg, `captureRate` 3..255, `color` = PokeAPI color name.
- `isLegendary` = legendary **or** mythical. `isBaby` from PokeAPI.
- `evolvesFrom` / `evolvesTo[{id, level}]`: only species 1..251 (Gen-4 babies/evolutions are pruned, e.g. 마릴 has no evolvesFrom).
  Level normalization: level-up `min_level` → that level (smallest if versions differ); friendship → 20 (from a baby → 12); stone/item → 25; trade (incl. held item) → 36; other (time/stat/location) → 28.
  When an edge has several PokeAPI details the first one (the original mechanic) decides — regional-form items (galarica-cuff …) are ignored.
  이브이(133) branches (134, 135, 136, 196, 197) are all 25 — the game lets the child choose (`ui.pickEvolution`). 배루키(236) branches at 20.
  **Every branching species has one shared level** (the smallest of its branches), so `evolvesTo.length > 1` always means "offer a choice":
  냄새꼬(44) Lv25 → 라플레시아/아르코; 슈륙챙이(61) Lv25 → 강챙이/왕구리; 야돈(79) Lv36 → 야도란/야도킹; 이브이(133) Lv25 → 샤미드/쥬피썬더/부스터/에브이/블래키; 배루키(236) Lv20 → 시라소몬/홍수몬/카포에라.
  Examples: 피카츄(25) → 라이츄 Lv25; 이브이(133) → 샤미드 Lv25, 쥬피썬더 Lv25, 부스터 Lv25, 에브이 Lv25, 블래키 Lv25; 피츄(172) → 피카츄 Lv12; 배루키(236) → 시라소몬 Lv20, 홍수몬 Lv20, 카포에라 Lv20; 롱스톤(95) → 강철톤 Lv36; 슈륙챙이(61) → 강챙이 Lv25, 왕구리 Lv25.
- `habitats`: PokeAPI habitat. Legendaries → `['rare']`. If PokeAPI has none / 'rare' for a non-legendary it is derived from the primary type
  (water→waters-edge, rock→mountain, ground→rough-terrain, fighting→mountain, grass→forest, bug→forest, electric→urban, normal→grassland, flying→grassland, fairy→grassland, psychic→urban, poison→urban, ghost→cave, ice→cave, dragon→waters-edge, dark→urban, steel→cave, fire→mountain; water species ≥ 2 m or ≥ 100 kg → sea).
  Derived this run: 안농(201)→cave.
- `tier` 1..9 (DESIGN §7.5): legendary/mythical → 9. Otherwise base tier from the **capture rate of the chain's basic form**
  (first non-baby form; babies do not count as a stage): ≥190→1, 120–189→2, 75–119→3, 45–74→4, 25–44→5, <25→6;
  +2 per evolution stage, clamped to 8. Babies → 3.
- `obtainable`: legendary → `event`; basics & babies → `wild`; stage-1 evolutions → `wild` if tier ≤ 5 (피죤, 레트라, 라이츄 …) else `evolve`; stage-2 → `evolve`.
  Every `wild` species has ≥ 1 habitat used by an area (route1: grassland, urban · route2: grassland, forest · forest: forest ·
  route22: grassland + fishing waters-edge, sea · route3: mountain, rough-terrain, cave + fishing waters-edge). The build fails otherwise.
- Encounter pool (DESIGN §7.5) = species with a matching habitat, `tier ≤ unlocked`, `obtainable === 'wild'`. `evolve` species still carry their
  PokeAPI habitat for dex/info purposes; the pool must filter by `obtainable`.

### Manual overrides
- #129 잉어킹: {"habitats":["waters-edge","sea"]}
- #201 안농: {"habitats":["cave"]}

### Summary
| tier | count |
|---|---|
| 1 | 61 |
| 2 | 7 |
| 3 | 70 |
| 4 | 50 |
| 5 | 24 |
| 6 | 19 |
| 7 | 1 |
| 8 | 8 |
| 9 | 11 |

| tier (wild only) | count |
|---|---|
| 1 | 61 |
| 2 | 7 |
| 3 | 70 |
| 4 | 50 |
| 5 | 7 |

| habitat | count |
|---|---|
| cave | 16 |
| forest | 41 |
| grassland | 57 |
| mountain | 30 |
| rare | 11 |
| rough-terrain | 13 |
| sea | 24 |
| urban | 32 |
| waters-edge | 28 |

| habitat (wild only) | count |
|---|---|
| cave | 13 |
| forest | 37 |
| grassland | 44 |
| mountain | 24 |
| rough-terrain | 13 |
| sea | 21 |
| urban | 24 |
| waters-edge | 20 |

| obtainable | count |
|---|---|
| event | 11 |
| evolve | 45 |
| wild | 195 |

| area (wild pool size, all tiers) | count |
|---|---|
| route1 | 68 |
| route2 | 81 |
| forest | 37 |
| route22 | 84 |
| route3 | 70 |

### Legendary / event (tier 9)
프리져(144), 썬더(145), 파이어(146), 뮤츠(150), 뮤(151), 라이코(243), 앤테이(244), 스이쿤(245), 루기아(249), 칠색조(250), 세레비(251)

### Babies (tier 3, wild)
피츄(172), 삐(173), 푸푸린(174), 토게피(175), 배루키(236), 뽀뽀라(238), 에레키드(239), 마그비(240)
<!-- END:data -->

<!-- BEGIN:sprites -->
## 스프라이트: public/assets/pokemon/

Source: Korean Pokémon wiki (pokemon.fandom.com/ko) via the MediaWiki API, cached in `.cache/sprites/`.
Regenerate with `npm run data:sprites` (`-- --refresh` re-resolves and re-downloads). Built 2026-09-30.

| atlas | wiki file name (NNN = 3-digit id) | cell | layout | sprites | fallback (GitHub PokeAPI/sprites) | size |
|---|---|---|---|---|---|---|
| front.png | 도트_2금_NNN.png (Gold front) | 56 px | 16 cols × 16 rows, index = id−1, centered, bottom-aligned | 251/251 | none | 896×896, 245 KB |
| back.png | 도트_뒷_2세대_NNN.png (Gen-2 back) | 56 px | same | 251/251 | none | 896×896, 201 KB |
| icons.png | NNN박스아이콘.png (box icon) | 32 px | 16 cols × 16 rows, index = id−1, centered | 251/251 | none | 512×512, 36 KB (palette) |

- `atlas.json` = `AtlasInfo` (types.ts): `{ front: { url, cell: 56, cols: 16 }, back: {…}, icons: { url, cell: 32, cols: 16 }, count: 251 }`.
  Cell of species `id`: `sx = ((id-1) % cols) * cell`, `sy = floor((id-1) / cols) * cell`. URLs are relative to the site root (`base: './'`).
- Background: only white connected to the image border is made transparent (flood fill), so white eyes/bellies stay white.
- Icons: if the wiki icon has two stacked animation frames only the first is used (ids: none).
- Alternative icon titles used: none.
- Missing after all fallbacks: front none; back none; icons none.
- Oversized sources downscaled (nearest): none.
<!-- END:sprites -->
