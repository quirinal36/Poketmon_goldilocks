// UIService: dialog box, choices, toast, fades (ENGINE) + DOM screens delegated to ./screens (SCREENS agent).
import type { UIService } from '../core/types';
import * as screens from './screens';
import { Dialog } from './dialog';
import { createHud, type Hud } from './hud';
import { fadeIn, fadeOut, flash, toast } from './basic';

export interface UIServiceExt extends UIService {
  hud: Hud;
  /** true while a text box / choice is open */
  dialogOpen(): boolean;
}

export function createUI(): UIServiceExt {
  const dialogLayer = document.getElementById('layer-dialog') ?? document.body.appendChild(document.createElement('div'));
  const hudLayer = document.getElementById('layer-hud') ?? document.body.appendChild(document.createElement('div'));
  const dialog = new Dialog(dialogLayer);
  const hud = createHud(hudLayer);
  hud.setVisible(false);

  return {
    say: (lines, opts) => dialog.say(lines, opts),
    choose: (prompt, options, opts) => dialog.choose(prompt, options, opts),
    yesNo: (prompt, opts) => dialog.yesNo(prompt, opts),
    toast,
    fadeOut,
    fadeIn,
    flash,
    dialogOpen: () => dialog.isOpen,
    openStartMenu: screens.openStartMenu, openPokedex: screens.openPokedex, openParty: screens.openParty, openBag: screens.openBag,
    openTrainerCard: screens.openTrainerCard, openDailyPlan: screens.openDailyPlan, openCustomize: screens.openCustomize,
    openNameEntry: screens.openNameEntry, openParentArea: screens.openParentArea, openShop: screens.openShop, openPC: screens.openPC,
    pickStarter: screens.pickStarter, pickEvolution: screens.pickEvolution, showBadge: screens.showBadge, showTitle: screens.showTitle,
    hud,
  };
}
