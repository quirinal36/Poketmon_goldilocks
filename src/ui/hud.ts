// HUD (#layer-hud): map-name banner (slides in for 2 s), top-right study pill (📖 수학 ✓ · 영어 3/8)
// opening the daily plan, and a ☰ button opening the start menu.
import type { DailyPlan, LessonStatus, UIService } from '../core/types';
import { G } from '../game';
import { el } from '../core/util';
import type { WorldServiceExt } from '../world';

export type Hud = UIService['hud'] & { root: HTMLElement };

function subjectLabel(s: LessonStatus, name: string): string | null {
  switch (s.state) {
    case 'disabled': return null;
    case 'active': return `${name} ${Math.min(s.correct, s.required)}/${s.required}`;
    case 'completed_today':
    case 'locked_until_tomorrow': return `${name} ✓`;
    case 'finished': return `${name} 🏁`;
    default: return name;
  }
}

export function planText(plan: DailyPlan | null): string {
  if (!plan) return '📖 오늘의 공부';
  const parts = [subjectLabel(plan.math, '수학'), subjectLabel(plan.english, '영어')].filter((x): x is string => !!x);
  if (!parts.length) return '📖 오늘의 공부';
  return (plan.allDoneToday ? '🎉 ' : '📖 ') + parts.join(' · ');
}

export function createHud(layer: HTMLElement): Hud {
  const banner = el('div', { class: 'hud-banner' });
  const study = el('button', { class: 'hud-study', type: 'button', 'aria-label': '오늘의 공부' }, '📖 오늘의 공부');
  const menu = el('button', { class: 'hud-menu', type: 'button', 'aria-label': '메뉴' }, '☰');
  const right = el('div', { class: 'hud-right' }, study, menu);
  const root = el('div', { class: 'hud-root' }, banner, right);
  layer.append(root);

  let bannerTimer = 0;
  const world = () => G.world as WorldServiceExt | undefined;

  const stop = (e: Event) => { e.stopPropagation(); };
  for (const b of [study, menu]) {
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); b.classList.add('pressed'); });
    b.addEventListener('pointerup', () => b.classList.remove('pressed'));
    b.addEventListener('pointercancel', () => b.classList.remove('pressed'));
    b.addEventListener('click', stop);
  }
  menu.addEventListener('click', () => {
    const w = world();
    if (w?.isLocked?.()) return;
    if (w?.openMenu) void w.openMenu();
    else void G.ui.openStartMenu();
  });
  study.addEventListener('click', () => {
    const w = world();
    if (w?.isLocked?.()) return;
    if (w?.openDailyPlan) void w.openDailyPlan();
    else void G.ui.openDailyPlan();
  });

  const hud: Hud = {
    root,
    setMapName(name: string) {
      if (!name) return;
      banner.textContent = name;
      banner.classList.remove('show');
      // restart the animation
      void banner.offsetWidth;
      banner.classList.add('show');
      clearTimeout(bannerTimer);
      bannerTimer = window.setTimeout(() => banner.classList.remove('show'), 2000);
    },
    refresh() {
      let plan: DailyPlan | null = null;
      try { plan = G.learn?.plan?.() ?? null; } catch { plan = null; }
      study.textContent = planText(plan);
    },
    setVisible(v: boolean) {
      root.style.display = v ? '' : 'none';
    },
  };
  return hud;
}
