// STUB — owned by the SCREENS agent (wave 2). Each function renders a DOM screen into #layer-screen
// (or #layer-modal for gates) and resolves when closed. Signatures mirror UIService in core/types.ts.
import type { ItemId, PlayerAppearance } from '../../core/types';
import { STARTERS } from '../../core/types';

export async function showTitle(): Promise<'new' | 'continue'> { return localStorage.getItem('pokestudy.save.v1') ? 'continue' : 'new'; }
export async function openStartMenu(): Promise<void> {}
export async function openPokedex(_focusId?: number): Promise<void> {}
export async function openParty(_mode: 'view' | 'choose' = 'view'): Promise<number | null> { return null; }
export async function openBag(_mode: 'view' | 'battle' = 'view'): Promise<ItemId | null> { return null; }
export async function openTrainerCard(): Promise<void> {}
export async function openDailyPlan(): Promise<void> {}
export async function openCustomize(_mode: 'intro' | 'mirror'): Promise<PlayerAppearance> {
  return { gender: 'boy', skin: 0, hairColor: 0, hairStyle: 0, outfit: 0, hat: true };
}
export async function openNameEntry(_title: string, suggestions: string[], initial?: string): Promise<string> { return initial || suggestions[0] || '골드'; }
export async function openParentArea(): Promise<void> {}
export async function openShop(_items: { item: ItemId; price: number }[]): Promise<void> {}
export async function openPC(): Promise<void> {}
export async function pickStarter(options: number[] = STARTERS): Promise<number> { return options[3] ?? 25; }
export async function pickEvolution(options: number[]): Promise<number> { return options[0]; }
export async function showBadge(_badgeId: string): Promise<void> {}
