import type { Game } from './core/types';

/**
 * Global service registry. Filled in by main.ts during boot.
 * Modules talk to each other ONLY through these interfaces (see core/types.ts).
 */
export const G = {} as Game;
(globalThis as any).__G = G;
