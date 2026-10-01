import type { AreaId, MapDef, MapId } from '../core/types';

const edge = `${'T'.repeat(11)}=${'T'.repeat(12)}`;
function road(id: MapId, name: string, area: AreaId, exits: MapDef['exits'] = []): MapDef {
  const tiles = Array.from({ length: 22 }, (_, y) => y === 11 ? '='.repeat(24) : `T${'.'.repeat(10)}=${'.'.repeat(11)}T`);
  tiles[0] = tiles[21] = edge;
  for (let y = 4; y <= 7; y++) tiles[y] = `T${'.'.repeat(4)}${'"'.repeat(5)}=${'.'.repeat(12)}T`;
  return { id, name, width: 24, height: 22, border: 'tree', music: 'route', indoor: false, area, tiles, exits, warps: [], npcs: [] };
}
function room(id: MapId, name: string, music: MapDef['music'] = 'town'): MapDef {
  return { id, name, width: 12, height: 10, border: 'wall', music, indoor: true,
    tiles: ['WWWWWWWWWWWW', ...Array.from({ length: 8 }, () => 'W__________W'), 'WWWWWmWWWWWW'], warps: [], npcs: [] };
}
const route24 = road('route24', '24번도로·금빛다리', 'route24', [
  { dir: 'down', to: 'cerulean', from: 11, toRange: 1, offset: 0 },
  { dir: 'up', to: 'route25', from: 11, toRange: 1, offset: 0 },
]);
route24.tiles[11] = `${'='.repeat(7)}${'H'.repeat(9)}${'='.repeat(8)}`;
route24.npcs = [{ id: 'bridge_trainer', x: 4, y: 10, sprite: 'camper', script: 'chapter3_bridge_trainer' }];
route24.signs = [{ x: 14, y: 9, text: ['금빛다리 → 이수재의 집', '대결은 원할 때만 해도 돼요.'] }];

const route25 = road('route25', '25번도로', 'route25', [
  { dir: 'down', to: 'route24', from: 11, toRange: 1, offset: 0 },
]);
route25.tiles[0] = 'T'.repeat(24);
route25.structures = [{ kind: 'house_blue', x: 16, y: 4 }];
route25.warps = [{ x: 17, y: 6, to: 'bill_house', tx: 5, ty: 8 }];
route25.signs = [{ x: 15, y: 9, text: ['이수재의 집', '도움이 필요하다면 들러 주세요.'] }];

const billHouse = room('bill_house', '이수재의 집', 'lab');
billHouse.tiles[3] = 'W_A______A_W';
billHouse.warps = [{ x: 5, y: 9, to: 'route25', tx: 17, ty: 7 }];
billHouse.npcs = [{ id: 'bill', x: 5, y: 2, sprite: 'scientist', script: 'chapter3_bill' }];
billHouse.objects = [{ x: 2, y: 3, script: 'chapter3_bill_light' }, { x: 9, y: 3, script: 'chapter3_bill_connection' }];

const route5 = road('route5', '5번도로', 'route5', [
  { dir: 'up', to: 'cerulean', from: 11, toRange: 1, offset: 0 },
]);
route5.tiles[21] = 'T'.repeat(24);
route5.structures = [{ kind: 'gate', x: 16, y: 10 }];
route5.warps = [{ x: 17, y: 11, to: 'underground_path', tx: 5, ty: 8 }];
route5.signs = [{ x: 14, y: 9, text: ['지하통로 → 6번도로·갈색시티'] }];

const underground = room('underground_path', '지하통로', 'forest');
underground.tiles[0] = 'WWWWWmWWWWWW';
underground.warps = [
  { x: 5, y: 9, to: 'route5', tx: 17, ty: 12 },
  { x: 5, y: 0, to: 'route6', tx: 17, ty: 12 },
];
underground.signs = [{ x: 7, y: 5, text: ['↑ 갈색시티', '↓ 블루시티'] }];

const route6 = road('route6', '6번도로', 'route6', [
  { dir: 'down', to: 'vermilion', from: 11, toRange: 1, offset: 0 },
]);
route6.tiles[0] = 'T'.repeat(24);
route6.structures = [{ kind: 'gate', x: 16, y: 10 }];
route6.warps = [{ x: 17, y: 11, to: 'underground_path', tx: 5, ty: 1 }];
route6.npcs = [{ id: 'route6_trainer', x: 4, y: 10, sprite: 'youngster', script: 'chapter3_route6_trainer' }];
route6.signs = [{ x: 14, y: 9, text: ['갈색시티 ↓', '지하통로는 동쪽 문이에요.'] }];

const vermilion = road('vermilion', '갈색시티', 'vermilion', [
  { dir: 'up', to: 'route6', from: 11, toRange: 1, offset: 0 },
]);
vermilion.music = 'city';
vermilion.tiles[21] = 'T'.repeat(24);
vermilion.tiles[11] = '='.repeat(24);
vermilion.structures = [
  { kind: 'center', x: 3, y: 3 }, { kind: 'mart', x: 16, y: 3 },
  { kind: 'gym', x: 3, y: 13 }, { kind: 'gate', x: 16, y: 14 },
];
vermilion.warps = [
  { x: 5, y: 6, to: 'vermilion_center', tx: 5, ty: 8 },
  { x: 17, y: 5, to: 'vermilion_mart', tx: 5, ty: 8 },
  { x: 5, y: 17, to: 'vermilion_gym', tx: 5, ty: 8 },
  { x: 17, y: 15, to: 'ss_anne_1f', tx: 5, ty: 8 },
];
vermilion.npcs = [
  { id: 'gym_guard', x: 5, y: 17, sprite: 'gymguide', script: 'chapter3_gym_gate', visibleIf: '!vermilion_gym_open' },
  { id: 'ship_guard', x: 17, y: 15, sprite: 'fisher', script: 'chapter3_ship_gate', visibleIf: '!ss_ticket_received' },
];
vermilion.signs = [{ x: 20, y: 11, text: ['← 포켓몬센터·체육관', '상트앙느호 선착장 →'] },
  { x: 22, y: 18, text: ['오렌지배지 후 블루시티 동쪽 돌산터널로 가요.'] }];
vermilion.onEnter = 'chapter3_vermilion_arrive';

const vermilionCenter = room('vermilion_center', '갈색시티 포켓몬센터', 'center');
vermilionCenter.tiles[2] = 'W_P______c_W';
vermilionCenter.tiles[3] = 'W____K_____W';
vermilionCenter.warps = [{ x: 5, y: 9, to: 'vermilion', tx: 5, ty: 7 }];
vermilionCenter.npcs = [{ id: 'nurse', x: 5, y: 2, sprite: 'nurse', script: 'nurse' }];
vermilionCenter.objects = [{ x: 9, y: 2, script: 'pc' }, { x: 2, y: 2, script: 'daily_board' }];
vermilionCenter.healSpot = { x: 5, y: 5 };

const vermilionMart = room('vermilion_mart', '갈색시티 프렌들리숍');
vermilionMart.tiles[3] = 'W____K_____W';
vermilionMart.warps = [{ x: 5, y: 9, to: 'vermilion', tx: 17, ty: 6 }];
vermilionMart.npcs = [{ id: 'clerk', x: 5, y: 2, sprite: 'clerk', script: 'shop' }];

const vermilionGym = room('vermilion_gym', '갈색체육관', 'gym');
vermilionGym.tiles[2] = 'WggggggggggW';
vermilionGym.tiles[3] = 'WggggggggggW';
vermilionGym.warps = [{ x: 5, y: 9, to: 'vermilion', tx: 5, ty: 18 }];
vermilionGym.npcs = [
  { id: 'guide', x: 3, y: 7, sprite: 'gymguide', script: 'chapter3_gym_guide' },
  { id: 'trainee', x: 8, y: 5, sprite: 'youngster', script: 'chapter3_trainee' },
  { id: 'surge', x: 5, y: 2, sprite: 'leader_surge', script: 'chapter3_leader' },
];

const ship = room('ss_anne_1f', '상트앙느호 선내');
ship.tiles[2] = 'W_U______U_W';
ship.warps = [
  { x: 5, y: 9, to: 'vermilion', tx: 17, ty: 16 },
  { x: 2, y: 2, to: 'ss_anne_captain', tx: 5, ty: 8 },
  { x: 9, y: 2, to: 'ss_anne_deck', tx: 5, ty: 8 },
];
ship.npcs = [
  { id: 'ship_nurse', x: 5, y: 4, sprite: 'nurse', script: 'chapter3_ship_heal' },
  { id: 'ship_rival', x: 8, y: 6, sprite: 'rival', script: 'chapter3_ship_rival' },
];
ship.signs = [{ x: 3, y: 4, text: ['← 선장실', '갑판 →'] }];

const deck = room('ss_anne_deck', '상트앙느호 갑판', 'route');
deck.tiles[3] = 'W___~~~~___W';
deck.warps = [{ x: 5, y: 9, to: 'ss_anne_1f', tx: 9, ty: 3 }];
deck.npcs = [{ id: 'sailor', x: 5, y: 5, sprite: 'fisher', script: 'chapter3_sailor' }];

const captain = room('ss_anne_captain', '상트앙느호 선장실');
captain.tiles[3] = 'W__n____n__W';
captain.warps = [{ x: 5, y: 9, to: 'ss_anne_1f', tx: 2, ty: 3 }];
captain.npcs = [{ id: 'captain', x: 5, y: 2, sprite: 'oldman', script: 'chapter3_captain' }];

export const CHAPTER3_MAPS = {
  route24, route25, bill_house: billHouse, route5, underground_path: underground, route6,
  vermilion, vermilion_center: vermilionCenter, vermilion_mart: vermilionMart,
  vermilion_gym: vermilionGym, ss_anne_1f: ship, ss_anne_deck: deck, ss_anne_captain: captain,
} satisfies Partial<Record<MapId, MapDef>>;
