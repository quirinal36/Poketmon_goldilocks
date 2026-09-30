import type { AreaId, BattleOutcome, BattleService, ItemId, PokemonInstance, TrainerDef } from '../core/types';
import { expToNext, maxHpFor, TYPE_MOVES } from '../core/types';
import { G } from '../game';
import { el, uid, josa } from '../core/util';
import { pokemonSprite } from '../core/sprite';
import { input } from '../core/input';

export const attackDamage = (maxHp: number, firstTry: boolean, roll = Math.random()): number => Math.ceil(maxHp * (.35 + roll * .15 + (firstTry ? .1 : 0)));
export const catchChance = (hp: number, maxHp: number, firstTry: boolean, great = false): number => hp <= maxHp / 2 ? 1 : Math.min(1, .6 + (firstTry ? .2 : 0) + (great ? .2 : 0));
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
      arena.replaceChildren(status(enemy, 'enemy-status'), el('div', { class: 'enemy-sprite' }, pokemonSprite(enemy.speciesId, 'front', 80)),
        el('div', { class: 'ally-sprite' }, pokemonSprite(p.speciesId, 'back', 80)), status(p, 'ally-status'));
      message.textContent = !trainer && enemy.hp <= enemy.maxHp / 2 ? '지금 몬스터볼을 던져 보세요!' : `${nameOf(p)}, 함께 힘내자!`;
    };
    const command = (): Promise<'fight' | 'ball' | 'bag' | 'flee'> => new Promise(resolve => {
      const actions = [['싸운다', 'fight'], ['몬스터볼', 'ball'], ['가방', 'bag'], ['도망간다', 'flee']] as const;
      const finish = (action: typeof actions[number][1]) => { off(); commands.replaceChildren(); resolve(action); };
      const buttons = actions.map(([label, action]) => {
        const b = el('button', { type: 'button', class: 'game-btn', onclick: () => finish(action) }, label);
        b.disabled = !!trainer && ['ball', 'flee'].includes(action); return b;
      });
      const off = input.subscribe(ev => {
        if (ev.type !== 'down') return true;
        const enabled = buttons.filter(b => !b.disabled), index = enabled.indexOf(document.activeElement as HTMLButtonElement);
        if (ev.button === 'a') enabled[Math.max(index, 0)].click();
        if (['up', 'down', 'left', 'right'].includes(ev.button)) enabled[(index + (['up', 'left'].includes(ev.button) ? enabled.length - 1 : 1)) % enabled.length].focus();
        return true;
      });
      commands.replaceChildren(...buttons); buttons[0].focus();
    });
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
              G.save.useItem(ball); G.audio.playSfx('ball_throw');
              for (let i = 0; i < 3; i++) { root.classList.toggle('ball-shake'); G.audio.playSfx('ball_shake'); await G.world.wait(250); }
              root.classList.remove('ball-shake');
              if (Math.random() < catchChance(enemy.hp, enemy.maxHp, result.firstTry, ball === 'greatball')) {
                enemy.hp = enemy.maxHp;
                const destination = G.save.addPokemon(enemy); G.save.markCaught(enemy.speciesId); G.save.data.stats.caught++;
                G.save.write('caught'); await G.audio.jingle('caught');
                await G.ui.say(`신난다! ${josa(nameOf(enemy), '을/를')} 잡았어요!`);
                if (await G.ui.yesNo('별명을 지어 줄까요?')) enemy.nickname = await G.ui.openNameEntry('친구의 별명', [nameOf(enemy)]);
                if (destination === 'box') await G.ui.say('친구가 여섯 마리라 PC로 보냈어요.');
                outcome = 'caught'; return outcome;
              }
              G.audio.playSfx('ball_pop'); await G.ui.say('아깝다! 힘을 조금 더 줄이고 다시 던져 보세요.');
            } else {
              enemy.hp = Math.max(0, enemy.hp - attackDamage(enemy.maxHp, result.firstTry)); G.audio.playSfx('hit');
              arena.classList.add('hit'); draw(); await G.world.wait(200); arena.classList.remove('hit');
              await G.ui.say(`${nameOf(p)}의 ${TYPE_MOVES[G.data.speciesById(p.speciesId).types[0]]}!`, { auto: true });
              await giveExp(lead, 5 + enemy.level);
            }
          } else {
            if (action === 'ball') await G.ui.say('앗, 몬스터볼이 빗나갔어요! 공은 그대로 있어요.');
            else { p.hp = Math.max(0, p.hp - Math.ceil(p.maxHp * (.12 + Math.random() * .06))); G.audio.playSfx(p.hp ? 'hit' : 'faint'); draw();
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
      const required = trainer.badge === 'cascade' ? 8 : trainer.badge === 'boulder' ? 4 : 0;
      if (G.learn.stage() < required) { await G.ui.say(`공부 도장 ${required}개를 모아 다시 와 주세요.`); return 'fled'; }
      if (G.save.data.defeatedTrainers.includes(id)) { await G.ui.say(trainer.after || trainer.defeat); return 'won'; }
      return run(trainer.team, trainer);
    }, giveExp, checkEvolutions,
  };
}
