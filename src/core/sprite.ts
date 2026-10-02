import { G } from '../game';
import { el } from './util';
export function pokemonSprite(id: number, side: 'front' | 'back' | 'icons' = 'front', size: number | string = 112): HTMLElement {
  const atlas = G.data.atlas[side];
  const rows = Math.ceil(G.data.atlas.count / atlas.cols), index = id - 1;
  const extent = typeof size === 'number' ? `${size}px` : size;
  return el('span', { class: 'pokemon-sprite', role: 'img', 'aria-label': G.data.speciesById(id).name,
    style: { display: 'inline-block', width: extent, height: extent, flexShrink: '0', imageRendering: 'pixelated',
      backgroundImage: `url("${atlas.url}")`, backgroundSize: `calc(${atlas.cols} * ${extent}) calc(${rows} * ${extent})`,
      backgroundPosition: `calc(${-(index % atlas.cols)} * ${extent}) calc(${-Math.floor(index / atlas.cols)} * ${extent})` } });
}
