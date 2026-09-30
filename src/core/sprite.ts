import { G } from '../game';
import { el } from './util';
export function pokemonSprite(id: number, side: 'front' | 'back' | 'icons' = 'front', size = 112): HTMLElement {
  const atlas = G.data.atlas[side];
  const rows = Math.ceil(G.data.atlas.count / atlas.cols), index = id - 1;
  return el('span', { class: 'pokemon-sprite', role: 'img', 'aria-label': G.data.speciesById(id).name,
    style: { display: 'inline-block', width: `${size}px`, height: `${size}px`, flexShrink: '0', imageRendering: 'pixelated',
      backgroundImage: `url("${atlas.url}")`, backgroundSize: `${atlas.cols * size}px ${rows * size}px`,
      backgroundPosition: `${-(index % atlas.cols) * size}px ${-Math.floor(index / atlas.cols) * size}px` } });
}
