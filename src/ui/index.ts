// STUB — owned by the ENGINE agent (dialog/hud/fade/toast). Screens delegate to ./screens (SCREENS agent).
import type { UIService } from '../core/types';
import * as screens from './screens';
export function createUI(): UIService {
  return {
    async say(lines) { console.log('[say]', lines); }, async choose() { return 0; }, async yesNo() { return true; },
    toast(m) { console.log('[toast]', m); }, async fadeOut() {}, async fadeIn() {}, async flash() {},
    openStartMenu: screens.openStartMenu, openPokedex: screens.openPokedex, openParty: screens.openParty, openBag: screens.openBag,
    openTrainerCard: screens.openTrainerCard, openDailyPlan: screens.openDailyPlan, openCustomize: screens.openCustomize,
    openNameEntry: screens.openNameEntry, openParentArea: screens.openParentArea, openShop: screens.openShop, openPC: screens.openPC,
    pickStarter: screens.pickStarter, pickEvolution: screens.pickEvolution, showBadge: screens.showBadge, showTitle: screens.showTitle,
    hud: { setMapName() {}, refresh() {}, setVisible() {} },
  };
}
