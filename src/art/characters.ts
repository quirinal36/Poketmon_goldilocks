// ============================================================================
// Art: overworld characters (16×16 frames, 4 dirs × 3 frames).
// Sprites are composed from layers (body / head / hair / hat / extras) so the
// player can be palette-swapped and every NPC stays distinct. Frames are
// baked once and cached; drawCharacter is a single drawImage.
// Sprite is drawn at (px, py - 4): the head overflows 4 px above the tile.
// ============================================================================
import type { Dir, NpcSpriteId, PlayerAppearance } from '../core/types';
import { C, bake, mirror, shade, stack, type Pal, makeCanvas, ctx2d } from './palette';

// ------------------------------------------------------- public palette ----
export const SKIN_TONES = ['#f8d0a8', '#e0a878', '#a86840'];
export const HAIR_COLORS = ['#302018', '#784020', '#e8b030', '#c03020', '#3050a0', '#70a040'];
export const OUTFIT_COLORS = ['#d83030', '#3068d8', '#30a048', '#e89020', '#9048c0', '#e860a0'];
export const HAIR_STYLE_NAMES: Record<'boy' | 'girl', string[]> = {
  boy: ['짧은 머리', '삐죽 머리', '곱슬 머리'],
  girl: ['양갈래', '단발', '긴 생머리'],
};
/** Vertical offset applied when drawing a character frame at a tile position. */
export const CHAR_OFFSET_Y = -4;

export const NPC_SPRITE_IDS: NpcSpriteId[] = [
  'mom', 'oak', 'rival', 'sister', 'aide', 'nurse', 'clerk', 'teacher', 'boy', 'girl', 'youngster', 'lass', 'oldman',
  'oldwoman', 'bugcatcher', 'camper', 'leader_rock', 'fisher', 'hiker', 'gymguide', 'man', 'woman', 'scientist',
  'rocket', 'clefairy', 'leader_water', 'leader_surge', 'leader_erika',
];

// ------------------------------------------------------------ layers -------
// Palette letters: k outline · s skin · e eye · h/H hair/shade · o/O shirt/shade · p/P pants/skirt ·
// w white · x shoes · a/A hat or accent · g glasses · b beard · y/Y straw · r red · c cane · n net
type Rows = string[];
const E: Rows = [];

// ---- heads (face)
const HEAD_DOWN: Rows = [
  '................',
  '................',
  '....kkkkkkkk....',
  '...kssssssssk...',
  '..kssssssssssk..',
  '..kssessssessk..',
  '..kssessssessk..',
  '..kssssssssssk..',
  '...kssssssssk...',
  '....kkkkkkkk....',
];
const HEAD_UP: Rows = [
  '................',
  '................',
  '....kkkkkkkk....',
  '...kssssssssk...',
  '..kssssssssssk..',
  '..kssssssssssk..',
  '..kssssssssssk..',
  '..kssssssssssk..',
  '...kssssssssk...',
  '....kkkkkkkk....',
];
const HEAD_LEFT: Rows = [
  '................',
  '................',
  '....kkkkkkkk....',
  '...kssssssssk...',
  '..kssssssssssk..',
  '..ksessssssssk..',
  '..ksessssssssk..',
  '..kssssssssssk..',
  '...kssssssssk...',
  '....kkkkkkkk....',
];

// ---- hair styles: [down, up, left]
type HairStyle = 'short' | 'spiky' | 'curly' | 'pigtails' | 'bob' | 'long' | 'bald' | 'bun' | 'ponytail' | 'messy';
const HAIR: Record<HairStyle, [Rows, Rows, Rows]> = {
  short: [
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhHhhhhHhk..',
      '..kh........hk..',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..kHhhhhhhhhHk..',
      '...kHH....HHk...',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '........hhhhh...',
      '.........hhhh...',
      '..........hhh...',
      '...........h....',
    ],
  ],
  spiky: [
    [
      '...k..kk..kk.k..',
      '..khkkhhkkhhkhk.',
      '..khhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khh........hhk.',
    ],
    [
      '...k..kk..kk.k..',
      '..khkkhhkkhhkhk.',
      '..khhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '..khhhhhhhhhhk..',
      '..kHhhhhhhhhHk..',
      '...kHH....HHk...',
    ],
    [
      '......k..kk.kk..',
      '....kkhkkhhkhhk.',
      '...khhhhhhhhhhk.',
      '..khhhhhhhhhhhk.',
      '..khhhhhhhhhhhk.',
      '........hhhhhhk.',
      '.........hhhhk..',
      '..........hhhk..',
      '...........hk...',
    ],
  ],
  curly: [
    [
      '....kk.kk.kk....',
      '...khhkhhkhhk...',
      '..khhhhhhhhhhk..',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhh......hhhk.',
      '..khh......hhk..',
      '..kh........hk..',
    ],
    [
      '....kk.kk.kk....',
      '...khhkhhkhhk...',
      '..khhhhhhhhhhk..',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '..khhhhhhhhhhk..',
      '...kHHHHHHHHk...',
    ],
    [
      '.....kk.kk.kk...',
      '....khhkhhkhhk..',
      '...khhhhhhhhhhk.',
      '..khhhhhhhhhhhk.',
      '..khhhhhhhhhhhk.',
      '..k....hhhhhhhk.',
      '..k.....hhhhhk..',
      '..k......hhhhk..',
      '...k......hhk...',
    ],
  ],
  pigtails: [
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '.khhhhhhhhhhhhk.',
      'khh..........hhk',
      'khH..........Hhk',
      'khH..........Hhk',
      '.kk..........kk.',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '.khhhhhhhhhhhhk.',
      'khhhhhhhhhhhhhhk',
      'khHhhhhhhhhhhHhk',
      'khHkhhhhhhhhkHhk',
      '.kk.kHHHHHHk.kk.',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhhk.',
      '........hhhhhhhk',
      '.........hhhkhhk',
      '..........hhkhhk',
      '...........hkkk.',
    ],
  ],
  bob: [
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khh......hhk..',
      '..khh......hhk..',
      '..khh......hhk..',
      '...kh......hk...',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '...kHHHHHHHHk...',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..kh....hhhhhk..',
      '..kh....hhhhhk..',
      '..kh.....hhhhk..',
      '...k.....hhhk...',
    ],
  ],
  long: [
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '.khhh......hhhk.',
      '.khhh......hhhk.',
      '.khhh......hhhk.',
      '.khhh......hhhk.',
      '.khh........hhk.',
      '.kk..........kk.',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khhhhhhhhhhhhk.',
      '.khHHHHHHHHHHhk.',
      '..kkkkkkkkkkkk..',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..kh....hhhhhhk.',
      '..kh....hhhhhhk.',
      '..kh.....hhhhhk.',
      '...k.....hhhhhk.',
      '.........hhhhhk.',
      '..........kkkk..',
    ],
  ],
  bald: [
    [
      '................',
      '................',
      '................',
      '................',
      '..kh........hk..',
      '..kh........hk..',
      '..kh........hk..',
    ],
    [
      '................',
      '................',
      '................',
      '................',
      '..kh........hk..',
      '..khh......hhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
    ],
    [
      '................',
      '................',
      '................',
      '................',
      '..........hhhk..',
      '.........hhhhk..',
      '.........hhhhk..',
      '..........hhhk..',
    ],
  ],
  bun: [
    [
      '......kkkk......',
      '.....khhhhk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khh......hhk..',
      '..kh........hk..',
    ],
    [
      '......kkkk......',
      '.....khhhhk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '...kHH....HHk...',
    ],
    [
      '........kkkk....',
      '.......khhhhk...',
      '....kkkhhhhhhk..',
      '...khhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..kh....hhhhhk..',
      '..k......hhhhk..',
      '..k.......hhhk..',
    ],
  ],
  ponytail: [
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhHhhhhHhk..',
      '..kh........hk..',
      '..kh........hk..',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '...kHHhhhhHHk...',
      '.....kkhhkk.....',
      '......khhk......',
      '......khhk......',
      '.......kk.......',
    ],
    [
      '.....kkkkkk.....',
      '....khhhhhhk....',
      '...khhhhhhhhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '........hhhhhk..',
      '.........hhhhkk.',
      '..........hhhhhk',
      '...........khhhk',
      '............khhk',
      '.............kk.',
    ],
  ],
  messy: [
    [
      '....k.kk.k.k....',
      '...khkhhkhkhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhHhhHhhhk..',
      '..kh........hk..',
    ],
    [
      '....k.kk.k.k....',
      '...khkhhkhkhk...',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..khhhhhhhhhhk..',
      '..kHhhhhhhhhHk..',
      '...kHH....HHk...',
    ],
    [
      '.....k.kk.k.k...',
      '....khkhhkhkhk..',
      '...khhhhhhhhhhk.',
      '..khhhhhhhhhhhk.',
      '..khhhhhhhhhhk..',
      '........hhhhh...',
      '.........hhhh...',
      '..........hhh...',
      '...........h....',
    ],
  ],
};

// ---- hats: [down, up, left]
type HatKind = 'cap' | 'playercap' | 'sunhat' | 'straw' | 'scout' | 'bucket' | 'nurse';
const HATS: Record<HatKind, [Rows, Rows, Rows]> = {
  cap: [
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kaaaaaaaaaak..', '.kAAAAAAAAAAAAk.'],
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kaaaaaaaaaak..', '..kaaaaaaaaaak..', '..kAAAAAAAAAAk..'],
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kaaaaaaaaaak..', 'kAAAAAAAAAAAAk..'],
  ],
  playercap: [
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaawwwwaak...', '..kaaawwwwaaak..', '.kAAAAAAAAAAAAk.'],
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kaaaaaaaaaak..', '..kaaaaaaaaaak..', '..kAAAAAAAAAAk..'],
    ['.....kkkkkk.....', '....kaaaaaak....', '...kawwaaaaak...', '..kawwwaaaaaak..', 'kAAAAAAAAAAAAk..'],
  ],
  sunhat: [
    ['.....kkkkkk.....', '....kwwwwwwk....', '....krrrrrrk....', '.kwwwwwwwwwwwwk.', '..kkkkkkkkkkkk..'],
    ['.....kkkkkk.....', '....kwwwwwwk....', '....krrrrrrk....', '.kwwwwwwwwwwwwk.', '..kkkkkkkkkkkk..'],
    ['.....kkkkkk.....', '....kwwwwwwk....', '....krrrrrrk....', '.kwwwwwwwwwwwwk.', '..kkkkkkkkkkkk..'],
  ],
  straw: [
    ['......kkkk......', '.....kyyyyk.....', '....kYYYYYYk....', 'kyyyyyyyyyyyyyyk', '.kkkkkkkkkkkkkk.'],
    ['......kkkk......', '.....kyyyyk.....', '....kYYYYYYk....', 'kyyyyyyyyyyyyyyk', '.kkkkkkkkkkkkkk.'],
    ['......kkkk......', '.....kyyyyk.....', '....kYYYYYYk....', 'kyyyyyyyyyyyyyyk', '.kkkkkkkkkkkkkk.'],
  ],
  scout: [
    ['.....kkkkkk.....', '....kaaaaaak....', '....kAAAAAAk....', '.kaaaaaaaaaaaak.', '..kkkkkkkkkkkk..'],
    ['.....kkkkkk.....', '....kaaaaaak....', '....kAAAAAAk....', '.kaaaaaaaaaaaak.', '..kkkkkkkkkkkk..'],
    ['.....kkkkkk.....', '....kaaaaaak....', '....kAAAAAAk....', '.kaaaaaaaaaaaak.', '..kkkkkkkkkkkk..'],
  ],
  bucket: [
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kAAAAAAAAAAk..', '.kaaaaaaaaaaaak.', '.kk..........kk.'],
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kAAAAAAAAAAk..', '.kaaaaaaaaaaaak.', '.kk..........kk.'],
    ['.....kkkkkk.....', '....kaaaaaak....', '...kaaaaaaaak...', '..kAAAAAAAAAAk..', '.kaaaaaaaaaaaak.', '.kk..........kk.'],
  ],
  nurse: [
    ['.....kkkkkk.....', '....kwwrrwwk....', '....kwwrrwwk....', '....kkkkkkkk....'],
    ['.....kkkkkk.....', '....kwwwwwwk....', '....kwwwwwwk....', '....kkkkkkkk....'],
    ['.....kkkkkk.....', '....kwrrwwwk....', '....kwrrwwwk....', '....kkkkkkkk....'],
  ],
};

// ---- bodies: rows 9..15 (7 rows). [down(stand, stepA), left(stand, stepA, stepB)]
type BodyKind = 'kid' | 'adult' | 'coat' | 'dress' | 'skirt';
interface BodySet { down: [Rows, Rows]; left: [Rows, Rows, Rows] }
const pad = (rows: Rows): Rows => [...Array(9).fill('................'), ...rows];

const BODIES: Record<BodyKind, BodySet> = {
  kid: {
    down: [
      pad(['...koooooooook..', '..kooooooooook..', '..ksoooooooosk..', '...kppppppppk...', '....kppkkppk....', '....ksskkssk....', '....kxxkkxxk....']),
      pad(['...koooooooook..', '..koooooooooosk.', '..ksooooooooook.', '...kppppppppk...', '....kppkkppk....', '....kxxkkssk....', '.....kk.kxxk....']),
    ],
    left: [
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '......kppppk....', '......kssssk....', '......kxxxxk....']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppk.kppk...', '....kssk.kssk...', '....kxxk.kxxk...']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '.....kppkkppk...', '.....ksskkssk...', '.....kxxkkxxk...']),
    ],
  },
  adult: {
    down: [
      pad(['...koooooooook..', '..kooooooooook..', '..ksoooooooosk..', '...kppppppppk...', '....kppkkppk....', '....kppkkppk....', '....kxxkkxxk....']),
      pad(['...koooooooook..', '..koooooooooosk.', '..ksooooooooook.', '...kppppppppk...', '....kppkkppk....', '....kxxkkppk....', '.....kk.kxxk....']),
    ],
    left: [
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '......kppppk....', '......kppppk....', '......kxxxxk....']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppk.kppk...', '....kppk.kppk...', '....kxxk.kxxk...']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '.....kppkkppk...', '.....kppkkppk...', '.....kxxkkxxk...']),
    ],
  },
  coat: {
    down: [
      pad(['...kwwwoowwwk...', '..kwwwwoowwwwk..', '..kswwwoowwwsk..', '...kwwwWWwwwk...', '....kwwkkwwk....', '....kppkkppk....', '....kxxkkxxk....']),
      pad(['...kwwwoowwwk...', '..kwwwwoowwwwsk.', '..kswwwoowwwwwk.', '...kwwwWWwwwk...', '....kwwkkwwk....', '....kxxkkppk....', '.....kk.kxxk....']),
    ],
    left: [
      pad(['.....kwwwwwwk...', '.....kowwwwwk...', '.....kswwwwwk...', '.....kwwwwwwk...', '......kwwwwk....', '......kppppk....', '......kxxxxk....']),
      pad(['.....kwwwwwwk...', '.....kowwwwwk...', '.....kswwwwwk...', '.....kwwwwwwk...', '....kwwk.kwwk...', '....kppk.kppk...', '....kxxk.kxxk...']),
      pad(['.....kwwwwwwk...', '.....kowwwwwk...', '.....kswwwwwk...', '.....kwwwwwwk...', '.....kwwkkwwk...', '.....kppkkppk...', '.....kxxkkxxk...']),
    ],
  },
  dress: {
    down: [
      pad(['...koooooooook..', '..kooooooooook..', '..ksoooooooosk..', '...kppppppppk...', '..kppppppppppk..', '..kppppppppppk..', '...kkxxkkxxkk...']),
      pad(['...koooooooook..', '..koooooooooosk.', '..ksooooooooook.', '...kppppppppk...', '..kppppppppppk..', '..kppppppppppk..', '...kkxxkk..kk...']),
    ],
    left: [
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppppppppk..', '....kppppppppk..', '.....kkxxxxkk...']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppppppppk..', '....kppppppppk..', '....kxxk...kxxk.']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppppppppk..', '....kppppppppk..', '.....kkxxxxkk...']),
    ],
  },
  skirt: {
    down: [
      pad(['...koooooooook..', '..kooooooooook..', '..ksoooooooosk..', '...kppppppppk...', '..kppppppppppk..', '....ksskkssk....', '....kxxkkxxk....']),
      pad(['...koooooooook..', '..koooooooooosk.', '..ksooooooooook.', '...kppppppppk...', '..kppppppppppk..', '....kxxkkssk....', '.....kk.kxxk....']),
    ],
    left: [
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppppppppk..', '......kssssk....', '......kxxxxk....']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppppppppk..', '....kssk.kssk...', '....kxxk.kxxk...']),
      pad(['.....koooooook..', '.....koooooook..', '.....ksoooook...', '.....kppppppk...', '....kppppppppk..', '.....ksskkssk...', '.....kxxkkxxk...']),
    ],
  },
};

// ---- extras (z: 'back' = after body, before head; 'front' = after hat)
type ExtraKind = 'glasses' | 'sunglasses' | 'beard' | 'cane' | 'net' | 'rod' | 'backpack' | 'apron' | 'vest' | 'straps';
interface Extra { z: 'back' | 'front'; down: Rows; up: Rows; left: Rows }
const EXTRAS: Record<ExtraKind, Extra> = {
  glasses: {
    z: 'front',
    down: ['', '', '', '', '', '....geggggeg....', '....ggg..ggg....'],
    up: E,
    left: ['', '', '', '', '', '...gegggg.......', '...ggg..........'],
  },
  sunglasses: {
    z: 'front',
    down: ['', '', '', '', '', '....gggggggg....', '....ggg..ggg....'],
    up: E,
    left: ['', '', '', '', '', '...ggggggg......', '...ggg..........'],
  },
  beard: {
    z: 'front',
    down: ['', '', '', '', '', '', '', '..kbbbbbbbbbbk..', '...kbbbbbbbbk...'],
    up: E,
    left: ['', '', '', '', '', '', '', '..kbbbbb........', '...kbbbb........'],
  },
  cane: {
    z: 'front',
    down: ['', '', '', '', '', '', '', '', '', '', '.............cc.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.'],
    up: ['', '', '', '', '', '', '', '', '', '', '.cc.............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............'],
    left: ['', '', '', '', '', '', '', '', '', '', '..cc............', '..c.............', '..c.............', '..c.............', '..c.............', '..c.............'],
  },
  net: {
    z: 'front',
    down: ['............kkk.', '...........knnnk', '...........knnnk', '............kkk.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.'],
    up: ['.kkk............', 'knnnk...........', 'knnnk...........', '.kkk............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............'],
    left: ['............kkk.', '...........knnnk', '...........knnnk', '............kkk.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.'],
  },
  rod: {
    z: 'front',
    down: ['...............k', '...............k', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.'],
    up: ['k...............', 'k...............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............', '.c..............'],
    left: ['...............k', '...............k', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.', '..............c.'],
  },
  backpack: {
    z: 'back',
    down: E,
    up: ['', '', '', '', '', '', '', '', '....kkkkkkkk....', '...kaaaaaaaak...', '...kaaaaaaaak...', '...kaAAAAAAak...', '...kaaaaaaaak...', '....kkkkkkkk....'],
    left: ['', '', '', '', '', '', '', '', '...........kkkk.', '..........kaaaak', '..........kaaaak', '..........kaAAak', '..........kaaaak', '...........kkkk.'],
  },
  straps: {
    z: 'back',
    down: ['', '', '', '', '', '', '', '', '', '....a......a....', '....a......a....', '....a......a....'],
    up: E,
    left: E,
  },
  apron: {
    z: 'back',
    down: ['', '', '', '', '', '', '', '', '', '', '......wwww......', '.....wwwwww.....', '.....wwwwww.....', '.....wwwwww.....', '.....wwwwww.....'],
    up: E,
    left: ['', '', '', '', '', '', '', '', '', '', '.....www........', '.....wwww.......', '.....wwww.......', '.....wwww.......', '.....wwww.......'],
  },
  vest: {
    z: 'back',
    down: ['', '', '', '', '', '', '', '', '', '....aa....aa....', '...aa......aa...', '...aa......aa...', '....aa....aa....'],
    up: ['', '', '', '', '', '', '', '', '', '....aaaaaaaa....', '...aaaaaaaaaa...', '...aaaaaaaaaa...', '....aaaaaaaa....'],
    left: ['', '', '', '', '', '', '', '', '', '......aa...aa...', '......aa...aa...', '......aa...aa...', '......aa...aa...'],
  },
};

// ------------------------------------------------------------- specs -------
export interface CharSpec {
  body: BodyKind;
  hair: HairStyle;
  hat?: HatKind;
  extras?: ExtraKind[];
  pal: Pal;
}

const basePal = (skin: string, hair: string, shirt: string, pants: string, extra: Pal = {}): Pal => ({
  k: C.ink, e: '#181818', w: C.white, W: C.gray2, x: '#303030',
  s: skin, S: shade(skin, 0.78),
  h: hair, H: shade(hair, 0.72),
  o: shirt, O: shade(shirt, 0.75),
  p: pants, P: shade(pants, 0.75),
  a: '#4070d0', A: '#2850a0', g: '#282830', b: '#603818', c: '#7a4a20', n: '#e8f0f8', y: C.yellow, Y: C.yellowD, r: C.red,
  ...extra,
});
const SKIN = SKIN_TONES[0];

const NPC_SPECS: Record<NpcSpriteId, CharSpec> = {
  mom: { body: 'dress', hair: 'ponytail', extras: ['apron'], pal: basePal(SKIN, '#a05028', '#e06888', '#b83860') },
  oak: { body: 'coat', hair: 'short', pal: basePal(SKIN, '#c8c8c8', '#e08030', '#786048') },
  rival: { body: 'adult', hair: 'spiky', pal: basePal(SKIN, '#7a3c14', '#8040c0', '#282838') },
  sister: { body: 'dress', hair: 'long', pal: basePal(SKIN, '#d09040', '#58c068', '#308848') },
  aide: { body: 'coat', hair: 'short', extras: ['glasses'], pal: basePal(SKIN, '#404048', '#4098d0', '#606870') },
  nurse: { body: 'dress', hair: 'bob', hat: 'nurse', pal: basePal(SKIN, '#f080a8', '#f8f8f8', '#f090b0') },
  clerk: { body: 'adult', hair: 'short', hat: 'cap', pal: basePal(SKIN, '#302018', '#4060d0', '#3040a0', { a: '#4060d0', A: '#2840a0' }) },
  teacher: { body: 'dress', hair: 'bob', extras: ['glasses'], pal: basePal(SKIN, '#6a3a1a', '#d8a850', '#806040') },
  boy: { body: 'kid', hair: 'short', pal: basePal(SKIN, '#302018', '#50b850', '#3060c0') },
  girl: { body: 'skirt', hair: 'bob', pal: basePal(SKIN, '#784020', '#f0d040', '#e04050') },
  youngster: { body: 'kid', hair: 'short', hat: 'cap', pal: basePal(SKIN, '#302018', '#f0d848', '#3060c8', { a: '#48a0e0', A: '#3070b0' }) },
  lass: { body: 'skirt', hair: 'pigtails', pal: basePal(SKIN, '#a06030', '#e04050', '#4060d0') },
  oldman: { body: 'adult', hair: 'bald', extras: ['cane'], pal: basePal(SKIN, '#e8e8e8', '#a0a0b8', '#605070') },
  oldwoman: { body: 'dress', hair: 'bun', pal: basePal(SKIN, '#d0d0d8', '#a070b0', '#705080') },
  bugcatcher: { body: 'kid', hair: 'short', hat: 'straw', extras: ['net'], pal: basePal(SKIN, '#302018', '#50b850', '#4060c0') },
  camper: { body: 'kid', hair: 'short', hat: 'scout', pal: basePal(SKIN, '#784020', '#e07030', '#605030', { a: '#80a040', A: '#587030' }) },
  leader_rock: { body: 'adult', hair: 'spiky', extras: ['vest'], pal: basePal(SKIN, '#503018', '#e88030', '#705038', { a: '#40a050', A: '#287838' }) },
  fisher: { body: 'adult', hair: 'short', hat: 'bucket', extras: ['rod'], pal: basePal(SKIN, '#302018', '#3080b0', '#606870', { a: '#b0a060', A: '#807040' }) },
  hiker: { body: 'adult', hair: 'short', extras: ['beard', 'backpack', 'straps'], pal: basePal(SKIN, '#503818', '#508050', '#705038', { a: '#d09040', A: '#a07030', b: '#503818' }) },
  gymguide: { body: 'adult', hair: 'short', extras: ['sunglasses'], pal: basePal(SKIN, '#302018', '#f0f0f0', '#4048d0', { g: '#101010' }) },
  man: { body: 'adult', hair: 'short', pal: basePal(SKIN, '#5a3a20', '#4070c0', '#504048') },
  woman: { body: 'dress', hair: 'long', pal: basePal(SKIN, '#8a4a20', '#f0c040', '#c05070') },
  scientist: { body: 'coat', hair: 'messy', pal: basePal(SKIN, '#404048', '#40c0c0', '#505860') },
  rocket: { body: 'adult', hair: 'short', hat: 'cap', pal: basePal(SKIN, '#303038', '#e8e8e8', '#303038', { a: '#d83030', A: '#a02020' }) },
  clefairy: { body: 'kid', hair: 'bald', pal: basePal('#f8b8c8', '#f8b8c8', '#f8b8c8', '#e890a8') },
  leader_water: { body: 'skirt', hair: 'ponytail', pal: basePal(SKIN, '#e07030', '#50a0d8', '#2868a8') },
  leader_surge: { body: 'adult', hair: 'spiky', pal: basePal(SKIN, '#e8d050', '#d8a820', '#806030') },
  leader_erika: { body: 'skirt', hair: 'long', pal: basePal(SKIN, '#303020', '#70b868', '#386838') },
};

const BOY_HAIR: HairStyle[] = ['short', 'spiky', 'curly'];
const GIRL_HAIR: HairStyle[] = ['pigtails', 'bob', 'long'];
const BOY_PANTS = '#303860';

export function playerSpec(a: PlayerAppearance): CharSpec {
  const skin = SKIN_TONES[a.skin] ?? SKIN_TONES[0];
  const hair = HAIR_COLORS[a.hairColor] ?? HAIR_COLORS[0];
  const outfit = OUTFIT_COLORS[a.outfit] ?? OUTFIT_COLORS[0];
  const boy = a.gender !== 'girl';
  const style = (boy ? BOY_HAIR : GIRL_HAIR)[a.hairStyle] ?? (boy ? 'short' : 'bob');
  return {
    body: boy ? 'kid' : 'skirt',
    hair: style,
    hat: a.hat ? (boy ? 'playercap' : 'sunhat') : undefined,
    pal: basePal(skin, hair, outfit, boy ? BOY_PANTS : shade(outfit, 0.6), { a: outfit, A: shade(outfit, 0.7) }),
  };
}

// --------------------------------------------------------- compose ---------
function pick3<T>(arr: [T, T, T], dir: Dir): T { return dir === 'up' ? arr[1] : dir === 'left' || dir === 'right' ? arr[2] : arr[0]; }
function extraRows(e: Extra, dir: Dir): Rows { return dir === 'up' ? e.up : dir === 'left' || dir === 'right' ? e.left : e.down; }

/** Compose one 16×16 frame as rows (frame: 0 stand, 1 stepA, 2 stepB). */
export function composeFrame(spec: CharSpec, dir: Dir, frame: 0 | 1 | 2): Rows {
  const side = dir === 'left' || dir === 'right';
  const bodySet = BODIES[spec.body];
  let body: Rows;
  if (side) body = bodySet.left[frame];
  else body = frame === 0 ? bodySet.down[0] : frame === 1 ? bodySet.down[1] : mirror(bodySet.down[1]);
  const head = dir === 'up' ? HEAD_UP : side ? HEAD_LEFT : HEAD_DOWN;
  const hair = pick3(HAIR[spec.hair], dir);
  const hat = spec.hat ? pick3(HATS[spec.hat], dir) : null;
  const back: Rows[] = []; const front: Rows[] = [];
  for (const ex of spec.extras ?? []) {
    const e = EXTRAS[ex];
    const rows = extraRows(e, dir);
    if (!rows.length) continue;
    (e.z === 'back' ? back : front).push(rows);
  }
  // walking bob: on step frames the upper body dips 1px (GSC feel) — done by shifting head/hair/hat down.
  const bob = frame === 0 ? 0 : 1;
  const upper = stack(16, 16, head, hair, hat, ...front);
  const shifted = bob ? upper.slice(0, 15).map((r) => r) : upper;
  const upperRows = bob ? ['................', ...shifted] : upper;
  // hands-held items in 'front' extend below the head → they already moved with upper; fine.
  let rows = stack(16, 16, body, ...back, upperRows);
  if (dir === 'right') rows = mirror(rows);
  return rows;
}

// ------------------------------------------------------------- cache -------
const frameCache = new Map<string, HTMLCanvasElement>();
const DIRS: Dir[] = ['down', 'up', 'left', 'right'];

function appearanceKey(a: PlayerAppearance): string {
  return `P:${a.gender}:${a.skin}:${a.hairColor}:${a.hairStyle}:${a.outfit}:${a.hat ? 1 : 0}`;
}
function specFor(who: NpcSpriteId | PlayerAppearance): { key: string; spec: CharSpec } {
  if (typeof who === 'string') return { key: `N:${who}`, spec: NPC_SPECS[who] ?? NPC_SPECS.man };
  return { key: appearanceKey(who), spec: playerSpec(who) };
}

/** Get a baked 16×16 frame canvas for a character. */
export function characterFrame(who: NpcSpriteId | PlayerAppearance, dir: Dir, frame: 0 | 1 | 2): HTMLCanvasElement {
  const { key, spec } = specFor(who);
  const ck = `${key}|${dir}|${frame}`;
  let c = frameCache.get(ck);
  if (!c) {
    c = bake(composeFrame(spec, dir, frame), spec.pal, ck);
    frameCache.set(ck, c);
  }
  return c;
}

export function initCharacters(): void {
  for (const id of NPC_SPRITE_IDS) for (const d of DIRS) for (const f of [0, 1, 2] as const) characterFrame(id, d, f);
}

export function drawCharacter(ctx: CanvasRenderingContext2D, who: NpcSpriteId | PlayerAppearance, dir: Dir, frame: 0 | 1 | 2, px: number, py: number): void {
  ctx.drawImage(characterFrame(who, dir, frame), px, py + CHAR_OFFSET_Y);
}

/** Scaled sprite canvas for UI previews (16·scale square). */
export function characterCanvas(who: NpcSpriteId | PlayerAppearance, dir: Dir = 'down', frame: 0 | 1 | 2 = 0, scale = 3): HTMLCanvasElement {
  const src = characterFrame(who, dir, frame);
  const c = makeCanvas(16 * scale, 16 * scale);
  const ctx = ctx2d(c);
  ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}
