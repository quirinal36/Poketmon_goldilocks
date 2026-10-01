import type { AreaId, MapDef, MapId } from '../core/types';

function road(id: MapId, name: string, area: AreaId, exits: MapDef['exits'] = []): MapDef {
  const tiles = Array.from({ length: 22 }, (_, y) => y === 12 ? '='.repeat(24) : `T${'.'.repeat(10)}=${'.'.repeat(11)}T`);
  tiles[0] = tiles[21] = `${'T'.repeat(11)}=${'T'.repeat(12)}`;
  return { id, name, width: 24, height: 22, border: 'tree', music: 'route', indoor: false, area, tiles, exits, warps: [], npcs: [] };
}
function room(id: MapId, name: string, music: MapDef['music'] = 'town'): MapDef {
  return { id, name, width: 12, height: 10, border: 'wall', music, indoor: true,
    tiles: ['WWWWWWWWWWWW', ...Array.from({ length: 8 }, () => 'W__________W'), 'WWWWWmWWWWWW'], warps: [], npcs: [] };
}
function cave(id: MapId, name: string): MapDef {
  const tiles = Array.from({ length: 22 }, (_, y) => y === 21 ? `o${':'.repeat(10)}^${':'.repeat(11)}o` : `o${':'.repeat(22)}o`);
  tiles[0] = 'o'.repeat(24);
  return { id, name, width: 24, height: 22, border: 'cave_wall', music: 'forest', indoor: false,
    area: 'rock_tunnel', legend: { ':': 'cave_floor', o: 'cave_wall' }, tiles, warps: [], npcs: [] };
}
function grassPatch(map: MapDef, row: number) {
  for (let y = row; y < row + 3; y++) map.tiles[y] = `${map.tiles[y].slice(0, 3)}${'"'.repeat(5)}${map.tiles[y].slice(8)}`;
}
function pathTile(map: MapDef, x: number, y: number) {
  map.tiles[y] = `${map.tiles[y].slice(0, x)}=${map.tiles[y].slice(x + 1)}`;
}

const route9 = road('route9', '9번도로', 'route9', [
  { dir: 'left', to: 'cerulean', from: 12, toRange: 1, offset: 0 },
  { dir: 'right', to: 'route10_north', from: 12, toRange: 1, offset: 0 },
]);
grassPatch(route9, 5);
route9.npcs = [{ id: 'camper', x: 5, y: 10, sprite: 'camper', script: 'chapter4_route9_trainer' }];
route9.signs = [{ x: 13, y: 10, text: ['블루시티 ←', '돌산터널 →'] }];
route9.onEnter = 'chapter4_oak';

const route10North = road('route10_north', '10번도로 북쪽', 'route10', [
  { dir: 'left', to: 'route9', from: 12, toRange: 1, offset: 0 },
]);
grassPatch(route10North, 5);
route10North.tiles[21] = 'T'.repeat(24);
route10North.structures = [{ kind: 'gate', x: 16, y: 10 }];
route10North.warps = [{ x: 17, y: 11, to: 'rock_tunnel_1f', tx: 11, ty: 20 }];
route10North.npcs = [{ id: 'guide', x: 7, y: 10, sprite: 'aide', script: 'chapter4_route10_heal' }];
route10North.signs = [{ x: 14, y: 9, text: ['돌산터널은 오른쪽 문이에요.', '밝은 표지를 따라가세요.'] }];

const tunnel1f = cave('rock_tunnel_1f', '돌산터널 1층');
grassPatch(tunnel1f, 9);
tunnel1f.tiles[4] = `o${':'.repeat(17)}^${':'.repeat(4)}o`;
for (let y = 5; y <= 20; y++) pathTile(tunnel1f, 11, y);
for (let x = 11; x < 18; x++) pathTile(tunnel1f, x, 4);
tunnel1f.warps = [
  { x: 11, y: 21, to: 'route10_north', tx: 17, ty: 12 },
  { x: 18, y: 4, to: 'rock_tunnel_b1f', tx: 5, ty: 17, sfx: 'stairs' },
];
tunnel1f.npcs = [
  { id: 'rest_guide', x: 5, y: 5, sprite: 'aide', script: 'chapter4_tunnel_heal' },
  { id: 'hiker', x: 15, y: 13, sprite: 'hiker', script: 'chapter4_tunnel_trainer' },
];
tunnel1f.signs = [{ x: 12, y: 7, text: ['↗ 아래층 사다리', '↓ 10번도로 북쪽'] }];

const tunnelB1f = cave('rock_tunnel_b1f', '돌산터널 아래층');
grassPatch(tunnelB1f, 9);
tunnelB1f.tiles[18] = `o${':'.repeat(4)}u${':'.repeat(17)}o`;
for (let x = 5; x <= 11; x++) pathTile(tunnelB1f, x, 17);
for (let y = 18; y <= 20; y++) pathTile(tunnelB1f, 11, y);
tunnelB1f.warps = [
  { x: 5, y: 18, to: 'rock_tunnel_1f', tx: 18, ty: 5, sfx: 'stairs' },
  { x: 11, y: 21, to: 'route10_south', tx: 17, ty: 12 },
];
tunnelB1f.signs = [{ x: 13, y: 17, text: ['↓ 보라타운', '← 위층 사다리'] }];

const route10South = road('route10_south', '10번도로 남쪽', 'route10', [
  { dir: 'down', to: 'lavender', from: 11, toRange: 1, offset: 0 },
]);
grassPatch(route10South, 5);
route10South.tiles[0] = 'T'.repeat(24);
route10South.structures = [{ kind: 'gate', x: 16, y: 10 }];
route10South.warps = [{ x: 17, y: 11, to: 'rock_tunnel_b1f', tx: 11, ty: 20 }];
route10South.signs = [{ x: 13, y: 9, text: ['↓ 보라타운', '오른쪽 문은 돌산터널이에요.'] }];

const lavender = road('lavender', '보라타운', 'lavender', [
  { dir: 'up', to: 'route10_south', from: 11, toRange: 1, offset: 0 },
  { dir: 'left', to: 'route8', from: 12, toRange: 1, offset: 0 },
]);
lavender.music = 'town';
lavender.tiles[21] = 'T'.repeat(24);
lavender.structures = [{ kind: 'center', x: 3, y: 3 }];
lavender.warps = [{ x: 5, y: 6, to: 'lavender_center', tx: 5, ty: 8 }];
lavender.npcs = [{ id: 'gardener', x: 15, y: 10, sprite: 'oldwoman', script: 'chapter4_letter' }];
lavender.signs = [{ x: 19, y: 12, text: ['← 8번도로·무지개시티', '북쪽은 돌산터널이에요.'] }];
lavender.onEnter = 'chapter4_lavender_arrive';

const lavenderCenter = room('lavender_center', '보라타운 포켓몬센터', 'center');
lavenderCenter.tiles[2] = 'W_P______c_W';
lavenderCenter.tiles[3] = 'W____K_____W';
lavenderCenter.warps = [{ x: 5, y: 9, to: 'lavender', tx: 5, ty: 7 }];
lavenderCenter.npcs = [{ id: 'nurse', x: 5, y: 2, sprite: 'nurse', script: 'nurse' }];
lavenderCenter.objects = [{ x: 9, y: 2, script: 'pc' }, { x: 2, y: 2, script: 'daily_board' }];
lavenderCenter.healSpot = { x: 5, y: 5 };

const route8 = road('route8', '8번도로', 'route8', [
  { dir: 'right', to: 'lavender', from: 12, toRange: 1, offset: 0 },
]);
grassPatch(route8, 5);
route8.tiles[21] = 'T'.repeat(24);
route8.structures = [{ kind: 'gate', x: 16, y: 10 }];
route8.warps = [{ x: 17, y: 11, to: 'underground_path_west', tx: 5, ty: 8 }];
route8.signs = [{ x: 12, y: 9, text: ['무지개시티는 오른쪽 지하통로로 가요.'] }];

const westPath = room('underground_path_west', '서쪽 지하통로', 'forest');
westPath.tiles[0] = 'WWWWWmWWWWWW';
westPath.warps = [
  { x: 5, y: 9, to: 'route8', tx: 17, ty: 12 },
  { x: 5, y: 0, to: 'route7', tx: 17, ty: 12 },
];
westPath.signs = [{ x: 7, y: 5, text: ['↑ 무지개시티', '↓ 보라타운'] }];

const route7 = road('route7', '7번도로', 'route7', [
  { dir: 'right', to: 'celadon', from: 12, toRange: 1, offset: 0 },
]);
grassPatch(route7, 5);
route7.tiles[21] = 'T'.repeat(24);
route7.structures = [{ kind: 'gate', x: 16, y: 10 }];
route7.warps = [{ x: 17, y: 11, to: 'underground_path_west', tx: 5, ty: 1 }];
route7.signs = [{ x: 12, y: 9, text: ['→ 무지개시티', '서쪽 문은 지하통로예요.'] }];

const celadon = road('celadon', '무지개시티', 'celadon', [
  { dir: 'left', to: 'route7', from: 12, toRange: 1, offset: 0 },
]);
celadon.music = 'city';
celadon.tiles[21] = 'T'.repeat(24);
celadon.structures = [
  { kind: 'center', x: 3, y: 3 }, { kind: 'mart', x: 16, y: 3 },
  { kind: 'gym', x: 3, y: 13 }, { kind: 'gate', x: 16, y: 14 },
];
celadon.warps = [
  { x: 5, y: 6, to: 'celadon_center', tx: 5, ty: 8 },
  { x: 17, y: 5, to: 'celadon_mart', tx: 5, ty: 8 },
  { x: 5, y: 17, to: 'celadon_gym', tx: 5, ty: 8 },
  { x: 17, y: 15, to: 'celadon_garden', tx: 5, ty: 8 },
];
celadon.npcs = [{ id: 'gym_guard', x: 5, y: 17, sprite: 'gymguide', script: 'chapter4_gym_gate', visibleIf: '!celadon_gym_open' }];
celadon.signs = [{ x: 20, y: 11, text: ['← 포켓몬센터·체육관', '무지개정원 →'] }];
celadon.onEnter = 'chapter4_celadon_arrive';

const celadonCenter = room('celadon_center', '무지개시티 포켓몬센터', 'center');
celadonCenter.tiles[2] = 'W_P______c_W';
celadonCenter.tiles[3] = 'W____K_____W';
celadonCenter.warps = [{ x: 5, y: 9, to: 'celadon', tx: 5, ty: 7 }];
celadonCenter.npcs = [{ id: 'nurse', x: 5, y: 2, sprite: 'nurse', script: 'nurse' }];
celadonCenter.objects = [{ x: 9, y: 2, script: 'pc' }, { x: 2, y: 2, script: 'daily_board' }];
celadonCenter.healSpot = { x: 5, y: 5 };

const celadonMart = room('celadon_mart', '무지개시티 프렌들리숍');
celadonMart.tiles[3] = 'W____K_____W';
celadonMart.warps = [{ x: 5, y: 9, to: 'celadon', tx: 17, ty: 6 }];
celadonMart.npcs = [{ id: 'clerk', x: 5, y: 2, sprite: 'clerk', script: 'shop' }];

const garden = room('celadon_garden', '무지개정원', 'forest');
garden.tiles[3] = 'W__***____*W';
garden.warps = [{ x: 5, y: 9, to: 'celadon', tx: 17, ty: 16 }];
garden.npcs = [
  { id: 'gardener', x: 5, y: 2, sprite: 'oldwoman', script: 'chapter4_garden' },
  { id: 'rocket', x: 8, y: 5, sprite: 'rocket', script: 'chapter4_rocket', visibleIf: '!celadon_garden_helped' },
];
garden.signs = [{ x: 3, y: 5, text: ['보라타운 정원사의 친구가 이곳을 돌봐요.'] }];

const gym = room('celadon_gym', '무지개체육관', 'gym');
gym.tiles[2] = 'WggggggggggW';
gym.tiles[3] = 'WggggggggggW';
gym.warps = [{ x: 5, y: 9, to: 'celadon', tx: 5, ty: 18 }];
gym.npcs = [
  { id: 'guide', x: 3, y: 7, sprite: 'gymguide', script: 'chapter4_gym_guide' },
  { id: 'trainee', x: 8, y: 5, sprite: 'lass', script: 'chapter4_trainee' },
  { id: 'erika', x: 5, y: 2, sprite: 'leader_erika', script: 'chapter4_leader' },
];

export const CHAPTER4_MAPS = {
  route9, route10_north: route10North, rock_tunnel_1f: tunnel1f, rock_tunnel_b1f: tunnelB1f,
  route10_south: route10South, lavender, lavender_center: lavenderCenter,
  route8, underground_path_west: westPath, route7, celadon,
  celadon_center: celadonCenter, celadon_mart: celadonMart, celadon_garden: garden, celadon_gym: gym,
} satisfies Partial<Record<MapId, MapDef>>;
