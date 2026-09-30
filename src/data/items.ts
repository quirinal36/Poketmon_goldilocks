import type { ItemId } from '../core/types';

/** Korean item names (kid-level). */
export const ITEM_NAMES: Record<ItemId, string> = {
  pokeball: '몬스터볼',
  greatball: '슈퍼볼',
  potion: '상처약',
  rod: '낚싯대',
  dex: '포켓몬 도감',
  stamp_card: '도장 카드',
};

/** Short kid-level descriptions (bag screen). */
export const ITEM_DESC: Record<ItemId, string> = {
  pokeball: '야생 포켓몬을 잡을 때 던져요.',
  greatball: '몬스터볼보다 더 잘 잡혀요.',
  potion: '포켓몬의 힘을 조금 되찾아 줘요.',
  rod: '물가에서 포켓몬을 낚을 수 있어요.',
  dex: '만난 포켓몬을 기록하는 도감이에요.',
  stamp_card: '공부 도장을 모으는 카드예요.',
};

export const ITEM_IDS: ItemId[] = ['pokeball', 'greatball', 'potion', 'rod', 'dex', 'stamp_card'];

export function itemName(id: string): string {
  return (ITEM_NAMES as Record<string, string>)[id] ?? id;
}
