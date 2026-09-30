import { initArt, drawTile, drawStructure, drawCharacter, STRUCTURES, itemIcon } from '../src/art';
import { TILE_IDS } from '../src/art/tiles';
import { NPC_SPRITE_IDS } from '../src/art/characters';
import { defaultSave } from '../src/core/save';
import type { StructureKind, Dir, ItemId } from '../src/core/types';
await initArt();
const root = document.querySelector('main')!;
function group(title: string) { const h = document.createElement('h2'); h.textContent = title; const s = document.createElement('section'); root.append(h,s); return s; }
function card(parent: HTMLElement, name: string, width: number, height: number, draw: (c: CanvasRenderingContext2D) => void) {
  const figure = document.createElement('figure'), canvas = document.createElement('canvas'), caption = document.createElement('figcaption');
  canvas.width = width; canvas.height = height; canvas.style.width = `${width*3}px`; canvas.style.height = `${height*3}px`; caption.textContent = name;
  draw(canvas.getContext('2d')!); figure.append(canvas,caption); parent.append(figure);
}
const tiles = group('타일 · 네 프레임');
for (const id of TILE_IDS) card(tiles,id,64,16,c => { for(let f=0;f<4;f++) drawTile(c,id,f*16,0,f,15); });
const buildings = group('건물 · 빨간 점은 문');
for (const kind of Object.keys(STRUCTURES) as StructureKind[]) { const s=STRUCTURES[kind]; card(buildings,kind,s.w*16,s.h*16,c => { drawStructure(c,kind,0,0); if(s.door){c.fillStyle='red';c.fillRect(s.door.x*16+6,s.door.y*16+6,4,4);} }); }
const chars = group('캐릭터 · 앞/뒤/좌/우');
for (const who of [defaultSave().player.appearance,...NPC_SPRITE_IDS]) card(chars,typeof who==='string'?who:'player',64,20,c=>{(['down','up','left','right'] as Dir[]).forEach((dir,i)=>drawCharacter(c,who,dir,1,i*16,4));});
const icons = group('물건');
for (const id of ['pokeball','greatball','potion','rod','dex','stamp_card'] as ItemId[]) card(icons,id,16,16,c=>c.drawImage(itemIcon(id),0,0));
