import type { MapDef, MapId } from '../core/types';
import { MAP as m_pallet } from './pallet';
import { MAP as m_player_house_1f } from './player_house_1f';
import { MAP as m_player_house_2f } from './player_house_2f';
import { MAP as m_rival_house } from './rival_house';
import { MAP as m_oak_lab } from './oak_lab';
import { MAP as m_route1 } from './route1';
import { MAP as m_viridian } from './viridian';
import { MAP as m_viridian_center } from './viridian_center';
import { MAP as m_viridian_mart } from './viridian_mart';
import { MAP as m_viridian_school } from './viridian_school';
import { MAP as m_route22 } from './route22';
import { MAP as m_route2 } from './route2';
import { MAP as m_forest } from './forest';
import { MAP as m_pewter } from './pewter';
import { MAP as m_pewter_center } from './pewter_center';
import { MAP as m_pewter_mart } from './pewter_mart';
import { MAP as m_pewter_gym } from './pewter_gym';
import { MAP as m_route3 } from './route3';
import { MAP as m_mt_moon_front } from './mt_moon_front';
import { MAP as m_mt_moon_deep } from './mt_moon_deep';
import { MAP as m_route4 } from './route4';
import { MAP as m_cerulean } from './cerulean';
import { MAP as m_cerulean_center } from './cerulean_center';
import { MAP as m_cerulean_mart } from './cerulean_mart';
import { MAP as m_cerulean_gym } from './cerulean_gym';
import { CHAPTER3_MAPS } from './chapter3';
import { CHAPTER4_MAPS } from './chapter4';

export const MAPS: Record<MapId, MapDef> = {
  pallet: m_pallet,
  player_house_1f: m_player_house_1f,
  player_house_2f: m_player_house_2f,
  rival_house: m_rival_house,
  oak_lab: m_oak_lab,
  route1: m_route1,
  viridian: m_viridian,
  viridian_center: m_viridian_center,
  viridian_mart: m_viridian_mart,
  viridian_school: m_viridian_school,
  route22: m_route22,
  route2: m_route2,
  forest: m_forest,
  pewter: m_pewter,
  pewter_center: m_pewter_center,
  pewter_mart: m_pewter_mart,
  pewter_gym: m_pewter_gym,
  route3: m_route3,
  mt_moon_front: m_mt_moon_front,
  mt_moon_deep: m_mt_moon_deep,
  route4: m_route4,
  cerulean: m_cerulean,
  cerulean_center: m_cerulean_center,
  cerulean_mart: m_cerulean_mart,
  cerulean_gym: m_cerulean_gym,
  ...CHAPTER3_MAPS,
  ...CHAPTER4_MAPS,
};
