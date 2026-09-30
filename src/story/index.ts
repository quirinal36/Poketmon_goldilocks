import type { Script } from '../core/types';
import { SCRIPTS_PALLET } from './region_pallet';
import { SCRIPTS_VIRIDIAN } from './region_viridian';
import { SCRIPTS_PEWTER } from './region_pewter';
import { SCRIPTS_COMMON } from './common';
import { SCRIPTS_CHAPTER2 } from './chapter2';

/** All scripts by id. Region files must use unique ids (prefix with the region/map). */
export const SCRIPTS: Record<string, Script> = { ...SCRIPTS_COMMON, ...SCRIPTS_PALLET, ...SCRIPTS_VIRIDIAN, ...SCRIPTS_PEWTER, ...SCRIPTS_CHAPTER2 };
export { TRAINERS } from './trainers';
