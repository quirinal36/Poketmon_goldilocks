import type { AreaId, BattleMove, BattleOutcome, BattleService, ItemId, PokemonInstance, Species, TrainerDef } from '../core/types';
import { expToNext, maxHpFor } from '../core/types';
import { G } from '../game';
import { el, uid, josa } from '../core/util';
import { pokemonSprite } from '../core/sprite';
import { input } from '../core/input';

export const attackDamage = (maxHp: number, firstTry: boolean, roll = Math.random()): number => Math.ceil(maxHp * (.35 + roll * .15 + (firstTry ? .1 : 0)));
export const catchChance = (hp: number, maxHp: number, firstTry: boolean, great = false): number => hp <= maxHp / 2 ? 1 : Math.min(1, .6 + (firstTry ? .2 : 0) + (great ? .2 : 0));
/** Derive moves from species + level, so existing saves and evolutions need no migration. */
export function movesFor(species: Species, level: number): BattleMove[] {
  const available = (species.moves ?? []).filter(m => m.level <= level)
    .sort((a, b) => b.level - a.level || a.id - b.id).slice(0, 4);
  return available.length ? available : [{ id: 165, name: '몸부림', type: '노말', level: 1, kind: 'physical' }];
}

async function motion(node: HTMLElement, frames: Keyframe[], duration: number) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fast = G.debug && (window as any).__TEST__?.fastText;
  const animation = node.animate(frames, { duration: fast ? 25 : duration, easing: 'ease-in-out' });
  try { await animation.finished; } finally { animation.cancel(); }
}

const nameOf = (p: PokemonInstance) => p.nickname || G.data.speciesById(p.speciesId).name;
function makePokemon(speciesId: number, level: number, area?: AreaId): PokemonInstance {
  return { uid: uid('p_'), speciesId, level, exp: 0, hp: maxHpFor(level), maxHp: maxHpFor(level), caughtAt: new Date().toISOString(), caughtArea: area, friendship: 70 };
}

export function createBattle(): BattleService {
  let active = false;
  async function giveExp(i: number, amount: number) {
    const p = G.save.data.party[i]; if (!p || !Number.isFinite(amount) || amount <= 0) return;
    p.exp += Math.floor(amount);
    while (p.level < 100 && p.exp >= expToNext(p.level)) {
      p.exp -= expToNext(p.level); p.level++; p.maxHp = maxHpFor(p.level); p.hp = p.maxHp;
      await G.audio.jingle('levelup'); await G.ui.say(`${josa(nameOf(p), '은/는')} 레벨 ${p.level}이 되었어요!`);
    }
    if (p.level === 100) p.exp = 0;
    if (!active) { await checkEvolutions(); G.save.write('exp'); }
  }
  async function checkEvolutions() {
    for (const p of G.save.data.party) {
      const species = G.data.speciesById(p.speciesId);
      const choices = species.evolvesTo.filter(e => e.level <= p.level).map(e => e.id);
      if (!choices.length) continue;
      const id = choices.length > 1 ? await G.ui.pickEvolution(choices) : choices[0];
      const before = species.name;
      for (let i = 0; i < 3; i++) await G.ui.flash('#e8f0ff', 200);
      p.speciesId = id; G.save.markCaught(id);
      await G.audio.jingle('evolution');
      await G.ui.say(`축하해요! ${josa(before, '이/가')} ${josa(G.data.speciesById(id).name, '으로/로')} 진화했어요!`);
    }
  }
  async function run(team: { speciesId: number; level: number }[], trainer?: TrainerDef, area?: AreaId): Promise<BattleOutcome> {
    if (active || !G.save.data.party.length) return 'fled';
    active = true; G.world.lock(); G.ui.hud.setVisible(false);
    const layer = document.getElementById('layer-screen')!;
    const previous = layer.lastElementChild as HTMLElement | null; if (previous) previous.hidden = true;
    const arena = el('div', { class: 'battle-arena' });
    const commands = el('div', { class: 'battle-commands' });
    const message = el('p', { class: 'battle-message', role: 'status' });
    const root = el('section', { class: 'battle-screen', 'aria-label': '포켓몬 대결' }, arena, message, commands); layer.append(root);
    let lead = Math.max(0, G.save.data.party.findIndex(p => p.hp > 0)), enemy = makePokemon(team[0].speciesId, team[0].level, area);
    const draw = () => {
      const p = G.save.data.party[lead];
      const status = (who: PokemonInstance, cls: string) => el('div', { class: `battle-status ${cls}` }, el('strong', {}, `${nameOf(who)} Lv.${who.level}`),
        el('progress', { max: who.maxHp, value: who.hp, 'aria-label': `${nameOf(who)} HP` }), el('span', {}, `HP ${who.hp}/${who.maxHp}`));
      arena.replaceChildren(status(enemy, 'enemy-status'), el('div', { class: 'enemy-sprite' }, pokemonSprite(enemy.speciesId, 'front', 'var(--battle-sprite-size)')),
        el('div', { class: 'ally-sprite' }, pokemonSprite(p.speciesId, 'back', 'var(--battle-sprite-size)')), status(p, 'ally-status'));
      message.textContent = !trainer && enemy.hp <= enemy.maxHp / 2 ? '지금 몬스터볼을 던져 보세요!' : `${nameOf(p)}, 함께 힘내자!`;
    };
    type Action = 'fight' | 'ball' | 'bag' | 'flee' | 'back' | BattleMove;
    const command = (moves?: BattleMove[]): Promise<Action> => new Promise(resolve => {
      const actions: { label: string; value: Action; disabled?: boolean }[] = moves
        ? [...moves.map(move => ({ label: `${move.name} · ${move.type}`, value: move })), { label: '돌아가기', value: 'back' }]
        : [{ label: '싸운다', value: 'fight' }, { label: '몬스터볼', value: 'ball', disabled: !!trainer },
          { label: '가방', value: 'bag' }, { label: '도망간다', value: 'flee', disabled: !!trainer }];
      let done = false;
      const finish = (action: Action) => { if (done) return; done = true; off(); commands.replaceChildren(); resolve(action); };
      const buttons = actions.map(({ label, value, disabled }) => {
        const b = el('button', { type: 'button', class: 'game-btn', onclick: () => finish(value) }, label);
        b.disabled = !!disabled; return b;
      });
      const off = input.subscribe(ev => {
        if (ev.type !== 'down') return true;
        const enabled = buttons.filter(b => !b.disabled), index = enabled.indexOf(document.activeElement as HTMLButtonElement);
        if (ev.button === 'a') enabled[Math.max(index, 0)].click();
        if (ev.button === 'b' && moves) finish('back');
        if (['up', 'down', 'left', 'right'].includes(ev.button)) enabled[(index + (['up', 'left'].includes(ev.button) ? enabled.length - 1 : 1)) % enabled.length].focus();
        return true;
      });
      commands.classList.toggle('battle-moves', !!moves);
      commands.setAttribute('aria-label', moves ? '사용할 기술' : '대결 행동');
      commands.setAttribute('role', 'group');
      message.textContent = moves ? '사용할 기술을 골라 주세요.' : message.textContent;
      commands.replaceChildren(...buttons); buttons[0].focus();
    });
    const attack = async (side: 'ally' | 'enemy', move: BattleMove) => {
      const other = side === 'ally' ? 'enemy' : 'ally', direction = side === 'ally' ? 1 : -1;
      root.dataset.phase = 'attack';
      message.textContent = `${nameOf(side === 'ally' ? G.save.data.party[lead] : enemy)}의 ${move.name}!`;
      const attacker = arena.querySelector<HTMLElement>(`.${side}-sprite`)!;
      const defender = arena.querySelector<HTMLElement>(`.${other}-sprite`)!;
      await motion(attacker, [{ transform: 'translate(0, 0)' },
        { transform: `translate(${direction * (move.kind === 'physical' ? 30 : 14)}px, ${-direction * 12}px) scale(1.05)` }, { transform: 'translate(0, 0)' }], 320);
      G.audio.playSfx('hit'); root.dataset.phase = 'hit';
      await motion(defender, [{ opacity: 1 }, { opacity: .4, transform: `translateX(${direction * 12}px)` }, { opacity: 1, transform: 'translateX(0)' }], 240);
      root.dataset.phase = 'idle';
    };
    const capture = async (caught: boolean, item: 'pokeball' | 'greatball') => {
      const foe = arena.querySelector<HTMLElement>('.enemy-sprite')!;
      const friend = arena.querySelector<HTMLElement>('.ally-sprite')!;
      const bounds = arena.getBoundingClientRect(), from = friend.getBoundingClientRect(), to = foe.getBoundingClientRect();
      const x = to.left + to.width / 2 - bounds.left, y = to.top + to.height / 2 - bounds.top;
      const dx = from.left + from.width / 2 - bounds.left - x, dy = from.top + from.height / 2 - bounds.top - y;
      const ball = el('div', { class: `battle-ball ${item === 'greatball' ? 'great' : ''}`, 'aria-hidden': 'true', style: { left: `${x}px`, top: `${y}px` } },
        el('div', { class: 'ball-top' }), el('div', { class: 'ball-bottom' }), el('div', { class: 'ball-button' }));
      arena.append(ball);
      try {
        root.dataset.phase = 'throw'; message.textContent = '몬스터볼을 던졌어요!'; G.audio.playSfx('ball_throw');
        await motion(ball, [{ transform: `translate(${dx}px, ${dy}px) rotate(0deg)` },
          { transform: `translate(${dx / 2}px, ${dy / 2 - 65}px) rotate(360deg)` }, { transform: 'translate(0, 0) rotate(720deg)' }], 600);
        root.dataset.phase = 'absorb'; message.textContent = '포켓몬이 볼 안으로 들어갔어요!';
        await motion(foe, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.05)', opacity: 0 }], 280);
        foe.style.visibility = 'hidden';
        await motion(ball, [{ transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], 220);
        root.dataset.phase = 'shake'; message.textContent = '두근두근… 잡힐까요?';
        for (let i = 0; i < 3; i++) {
          G.audio.playSfx('ball_shake');
          await motion(ball, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-18deg)' }, { transform: 'rotate(18deg)' }, { transform: 'rotate(0deg)' }], 380);
        }
        if (caught) {
          root.dataset.phase = 'caught'; message.textContent = '잡았다!'; ball.classList.add('is-caught');
          await G.world.wait(450);
        } else {
          root.dataset.phase = 'breakout'; message.textContent = '볼이 열리고 포켓몬이 나왔어요!'; G.audio.playSfx('ball_pop');
          ball.classList.add('is-open');
          const top = ball.querySelector<HTMLElement>('.ball-top')!;
          await motion(top, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-20px) rotate(-25deg)', opacity: 0 }], 220);
          top.style.opacity = '0';
          foe.style.visibility = '';
          await motion(foe, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 300);
        }
      } finally { ball.remove(); if (!caught) foe.style.visibility = ''; }
    };
    let outcome: BattleOutcome = 'lost';
    try {
      G.audio.playMusic(trainer?.music || (trainer ? 'battle_trainer' : 'battle_wild'));
      if (trainer) await G.ui.say(trainer.intro, { speaker: trainer.name, portrait: trainer.image });
      for (let index = 0; index < team.length; index++) {
        enemy = makePokemon(team[index].speciesId, team[index].level, area); G.save.markSeen(enemy.speciesId); draw();
        G.audio.playCry(enemy.speciesId);
        await G.ui.say(trainer ? `${trainer.name}: ${nameOf(enemy)}, 나와라!` : `앗! 야생의 ${josa(nameOf(enemy), '이/가')} 나타났다!`);
        while (enemy.hp > 0) {
          let p = G.save.data.party[lead];
          if (p.hp <= 0) {
            if (!G.save.data.party.some(p => p.hp > 0)) {
              await G.ui.say(trainer?.purpose === 'tutorial' ? '좋은 승부였어! 잠깐 쉬고 다시 힘내자!' : '힘이 빠져서 포켓몬센터로 돌아가요.');
              return 'lost';
            }
            const selected = await G.ui.openParty('choose');
            lead = selected ?? G.save.data.party.findIndex(p => p.hp > 0); p = G.save.data.party[lead];
          }
          draw();
          let action = await command(); let item: ItemId | null = null;
          if (action === 'flee') return 'fled';
          let move: BattleMove | null = null;
          if (action === 'fight') {
            const choice = await command(movesFor(G.data.speciesById(p.speciesId), p.level));
            if (typeof choice === 'string') continue;
            move = choice;
          }
          if (action === 'bag') {
            item = await G.ui.openBag('battle'); if (!item) continue;
            if (item === 'potion') {
              if (p.hp >= p.maxHp) { G.ui.toast('이미 건강해요!'); continue; }
              if (G.save.useItem('potion')) { p.hp = Math.min(p.maxHp, p.hp + 20); G.save.write('potion'); } continue;
            }
            if (trainer) { G.ui.toast('다른 트레이너의 포켓몬은 잡을 수 없어요.'); continue; }
            action = 'ball';
          }
          const ball = item === 'greatball' ? 'greatball' : 'pokeball';
          if (action === 'ball' && !(G.save.data.bag[ball] || 0)) {
            G.ui.toast('몬스터볼이 없어요. 공부 도장을 모으거나 숍에서 살 수 있어요.'); continue;
          }
          const result = await G.learn.quiz({ purpose: action === 'ball' ? 'catch' : trainer?.purpose || 'wild' });
          if (result.correct) {
            p.friendship = Math.min(255, p.friendship + 1);
            if (action === 'ball') {
              G.save.useItem(ball);
              const caught = Math.random() < catchChance(enemy.hp, enemy.maxHp, result.firstTry, ball === 'greatball');
              await capture(caught, ball);
              if (caught) {
                enemy.hp = enemy.maxHp;
                const destination = G.save.addPokemon(enemy); G.save.markCaught(enemy.speciesId); G.save.data.stats.caught++;
                G.save.write('caught'); await G.audio.jingle('caught');
                await G.ui.say(`신난다! ${josa(nameOf(enemy), '을/를')} 잡았어요!`);
                if (await G.ui.yesNo('별명을 지어 줄까요?')) enemy.nickname = await G.ui.openNameEntry('친구의 별명', [nameOf(enemy)]);
                if (destination === 'box') await G.ui.say('친구가 여섯 마리라 PC로 보냈어요.');
                outcome = 'caught'; return outcome;
              }
              await G.ui.say('아깝다! 힘을 조금 더 줄이고 다시 던져 보세요.');
            } else {
              await attack('ally', move!);
              enemy.hp = Math.max(0, enemy.hp - attackDamage(enemy.maxHp, result.firstTry)); draw();
              await G.ui.say(`${nameOf(p)}의 ${move!.name}!`, { auto: true });
              await giveExp(lead, 5 + enemy.level);
            }
          } else {
            if (action === 'ball') await G.ui.say('앗, 몬스터볼이 빗나갔어요! 공은 그대로 있어요.');
            else { await attack('enemy', movesFor(G.data.speciesById(enemy.speciesId), enemy.level)[0]); p.hp = Math.max(0, p.hp - Math.ceil(p.maxHp * (.12 + Math.random() * .06))); G.audio.playSfx(p.hp ? 'hit' : 'faint'); draw();
              await G.ui.say(p.hp ? '괜찮아요! 다음 문제를 함께 풀어 봐요.' : `${josa(nameOf(p), '은/는')} 지쳐 버렸어요.`); }
          }
          G.save.write('battle-turn');
        }
      }
      outcome = 'won'; G.save.data.stats.battlesWon++;
      if (trainer && !G.save.data.defeatedTrainers.includes(trainer.id)) {
        G.save.data.defeatedTrainers.push(trainer.id); G.save.addMoney(trainer.reward);
        const flag = ({ bug_1: 'forest_bug1', bug_2: 'forest_bug2', camper_gym: 'gym_trainer1' } as Record<string, string>)[trainer.id];
        if (flag) G.save.setFlag(flag);
        if (trainer.badge && !G.save.data.player.badges.includes(trainer.badge)) {
          G.save.data.player.badges.push(trainer.badge); G.save.setFlag(`badge_${trainer.badge}`);
          if (trainer.badge === 'boulder') G.save.setFlag('route3_open');
        }
        G.save.write('trainer-win');
        await G.ui.say(trainer.defeat, { speaker: trainer.name, portrait: trainer.image });
        if (trainer.badge) {
          await G.ui.showBadge(trainer.badge);
          G.save.setFlag(`badge_${trainer.badge}_shown`);
          G.save.write('badge-shown'); G.world.refreshNpcs();
        }
      }
      await G.audio.jingle('victory'); return outcome;
    } finally {
      commands.replaceChildren(); root.remove(); if (previous) previous.hidden = false;
      try { await checkEvolutions(); } finally { active = false; G.save.write('battle'); G.ui.hud.setVisible(true); G.world.unlock(); }
    }
  }
  return {
    wild: (speciesId, level, opts) => run([{ speciesId, level }], undefined, opts?.area),
    async trainer(id) {
      const trainer = G.data.trainers[id]; if (!trainer) throw Error(`Unknown trainer: ${id}`);
      if (trainer.badge === 'cascade' && !G.save.data.player.badges.includes('boulder')) { await G.ui.say('회색배지를 받은 뒤 다시 와 주세요.'); return 'fled'; }
      if (trainer.badge === 'thunder') {
        if (!G.save.flag('captain_helped')) { await G.ui.say('상트앙느호의 선장을 돕고 와 주세요.'); return 'fled'; }
        if (!['boulder', 'cascade'].every(b => G.save.data.player.badges.includes(b))) { await G.ui.say('앞선 두 배지를 받고 와 주세요.'); return 'fled'; }
      }
      if (trainer.badge === 'rainbow') {
        if (!G.save.flag('celadon_garden_helped')) { await G.ui.say('무지개정원에서 씨앗상자를 돌려주고 와 주세요.'); return 'fled'; }
        if (!['boulder', 'cascade', 'thunder'].every(b => G.save.data.player.badges.includes(b))) { await G.ui.say('앞선 세 배지를 받고 와 주세요.'); return 'fled'; }
      }
      const required = trainer.badge === 'rainbow' ? 16 : trainer.badge === 'thunder' ? 12 : trainer.badge === 'cascade' ? 8 : trainer.badge === 'boulder' ? 4 : 0;
      if (G.learn.stage() < required) { await G.ui.say(`공부 도장 ${required}개를 모아 다시 와 주세요.`); return 'fled'; }
      if (G.save.data.defeatedTrainers.includes(id)) { await G.ui.say(trainer.after || trainer.defeat); return 'won'; }
      return run(trainer.team, trainer);
    }, giveExp, checkEvolutions,
  };
}
