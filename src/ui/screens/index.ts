import type { ItemId, PlayerAppearance, Subject } from '../../core/types';
import { STARTERS } from '../../core/types';
import { G } from '../../game';
import { el, asset, josa } from '../../core/util';
import { input } from '../../core/input';
import { repairSave } from '../../core/save';
import { pokemonSprite } from '../../core/sprite';
import { playerPortrait, HAIR_STYLE_NAMES } from '../../art';
import { ITEM_IDS, ITEM_NAMES, ITEM_DESC } from '../../data/items';

const button = (label: string, action: () => unknown, cls = '') => el('button', { type: 'button', class: `game-btn ${cls}`, onclick: async (e: Event) => {
  const b = e.currentTarget as HTMLButtonElement;
  b.disabled = true; G.audio.unlock(); G.audio.playSfx('select');
  try { await action(); } catch (error) { console.error(error); G.ui.toast('다시 시도해 주세요.'); } finally { b.disabled = false; }
} }, label);

// Screens stack for nested party/bag/settings panels and restore focus on close.
function screen<T>(title: string, render: (body: HTMLElement, done: (value: T) => void) => void, cancel?: T): Promise<T> {
  const layer = document.getElementById('layer-screen')!;
  const previous = layer.lastElementChild as HTMLElement | null;
  const focused = document.activeElement as HTMLElement | null;
  if (previous) previous.hidden = true;
  G.world.lock();
  return new Promise<T>(resolve => {
    const body = el('div', { class: 'screen-body' });
    const root = el('section', { class: 'game-screen', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, el('header', {}, el('h1', {}, title)), body);
    let closed = false;
    const done = (value: T) => {
      if (closed) return; closed = true;
      off(); root.remove(); if (previous) previous.hidden = false;
      G.world.unlock(); focused?.focus(); resolve(value);
    };
    const off = input.subscribe(ev => {
      if (ev.type !== 'down') return true;
      if (ev.button === 'b' && cancel !== undefined) done(cancel);
      if (ev.button === 'a' && document.activeElement instanceof HTMLButtonElement && root.contains(document.activeElement)) document.activeElement.click();
      if (['up', 'down', 'left', 'right'].includes(ev.button)) {
        const buttons = [...root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement), delta = ['up', 'left'].includes(ev.button) ? -1 : 1;
        buttons[(i + delta + buttons.length) % buttons.length]?.focus();
      }
      return true;
    });
    if (cancel !== undefined) root.firstElementChild!.append(button('닫기', () => done(cancel), 'close'));
    layer.append(root); render(body, done);
    root.querySelector<HTMLButtonElement>('button:not(.close)')?.focus();
  });
}

export function showTitle(): Promise<'new' | 'continue'> {
  G.audio.playMusic('title');
  return screen('포켓몬 공부 대모험', (body, done) => {
    body.parentElement!.classList.add('title-screen');
    body.append(el('div', { class: 'title-art', style: { backgroundImage: `url("${asset('assets/img/title_bg.png')}")` } },
      el('p', { class: 'eyebrow' }, '매일 조금씩, 함께 자라는 모험'), el('div', { class: 'title-friends' }, ...[1, 25, 158].map(id => pokemonSprite(id, 'front', 96)))));
    const actions = el('div', { class: 'title-actions' });
    if (G.save.exists()) actions.append(button('이어서 하기', () => done('continue'), 'primary'));
    actions.append(button('새로 시작', async () => {
      if (G.save.exists() && !await G.ui.yesNo('새로 시작하면 이 기기의 모험이 바뀌어요. 시작할까요?')) return;
      done('new');
    }, 'primary'), button('보호자', () => openParentArea()));
    body.append(actions, el('p', { class: 'muted' }, '방향키로 이동 · A로 대화 · START / M으로 메뉴'));
  });
}
export async function openStartMenu(): Promise<void> {
  await screen('모험 메뉴', body => {
    const entries: [string, () => Promise<unknown>][] = [
      ['포켓몬 도감', () => openPokedex()], ['내 포켓몬', () => openParty()], ['가방', () => openBag()],
      ['트레이너 카드', () => openTrainerCard()], ['오늘의 공부', () => openDailyPlan()],
      ['꾸미기', async () => { G.save.data.player.appearance = await openCustomize('mirror'); G.save.write('appearance'); }],
      ['레포트 쓰기', async () => { G.save.write(); G.audio.playSfx('save'); G.ui.toast('모험을 저장했어요!'); }], ['보호자', () => openParentArea()],
    ];
    body.append(el('div', { class: 'menu-grid' }, ...entries.map(([text, fn]) => button(text, fn))));
  }, null);
}
export async function openPokedex(focusId?: number): Promise<void> {
  await screen('포켓몬 도감', body => {
    const data = G.save.data;
    const summary = el('p', {}, `본 포켓몬 ${data.dex.seen.length} · 잡은 포켓몬 ${data.dex.caught.length} / 251`);
    const search = el('input', { type: 'search', placeholder: '이름이나 도감 번호', 'aria-label': '도감 검색' });
    const grid = el('div', { class: 'dex-grid' });
    const draw = () => {
      grid.replaceChildren(...G.data.species.filter(s => s.name.includes(search.value) || String(s.id).includes(search.value)).map(s => {
        const seen = data.dex.seen.includes(s.id), caught = data.dex.caught.includes(s.id);
        const card = button(`${String(s.id).padStart(3, '0')} ${seen ? s.name : '???'}${caught ? ' ●' : ''}`, async () => {
          await screen(seen ? s.name : '아직 만나지 못한 친구', inner => {
            if (seen) inner.append(pokemonSprite(s.id), el('p', {}, s.types.join(' · ')), el('p', {}, s.flavor));
            inner.append(el('p', {}, s.obtainable === 'evolve' ? '친구를 성장시키면 만날 수 있어요.' : s.obtainable === 'event' ? '학기 공부를 마치고 3번도로의 등산가를 만나 보세요.' : '매일 공부하며 풀숲과 물가를 찾아보세요.'));
          }, null);
        });
        if (seen) card.prepend(pokemonSprite(s.id, 'icons', 48));
        card.dataset.species = String(s.id); return card;
      }));
    };
    search.addEventListener('input', draw); body.append(summary, search, grid); draw();
    if (focusId) grid.querySelector(`[data-species="${focusId}"]`)?.scrollIntoView({ block: 'center' });
  }, null);
}
export function openParty(mode: 'view' | 'choose' = 'view'): Promise<number | null> {
  return screen<number | null>(mode === 'choose' ? '함께 싸울 친구' : '내 포켓몬', (body, done) => {
    const draw = () => {
      body.replaceChildren();
      if (!G.save.data.party.length) body.append(el('p', {}, '오박사 연구소에서 첫 친구를 만나 보세요.'));
      G.save.data.party.forEach((p, i) => {
        const name = p.nickname || G.data.speciesById(p.speciesId).name;
        const card = el('div', { class: 'pokemon-card' }, pokemonSprite(p.speciesId, 'front', 84),
          el('div', {}, el('h2', {}, `${i === 0 ? '★ ' : ''}${name}`), el('p', {}, `Lv.${p.level} · HP ${p.hp}/${p.maxHp}`)));
        if (mode === 'choose') {
          const b = button('선택', () => done(i)); b.disabled = p.hp <= 0; card.append(b);
        } else card.append(button('파트너로', () => { [G.save.data.party[0], G.save.data.party[i]] = [p, G.save.data.party[0]]; G.save.write('partner'); draw(); }),
          button('별명', async () => { p.nickname = await openNameEntry('친구의 별명', [G.data.speciesById(p.speciesId).name], name, 10); G.save.write('nickname'); draw(); }));
        body.append(card);
      });
    }; draw();
  }, null);
}
export function openBag(mode: 'view' | 'battle' = 'view'): Promise<ItemId | null> {
  return screen<ItemId | null>('가방', (body, done) => {
    const draw = () => {
      body.replaceChildren(el('p', {}, `용돈 ₩${G.save.data.player.money}`));
      for (const id of ITEM_IDS) {
        const count = G.save.data.bag[id] || 0; if (!count) continue;
        const b = button(`${ITEM_NAMES[id]} ×${count}`, async () => {
          if (mode === 'battle') { if (['potion', 'pokeball', 'greatball'].includes(id)) done(id); return; }
          if (id === 'potion') {
            const i = await openParty('choose'); if (i === null) return;
            const p = G.save.data.party[i];
            if (p.hp >= p.maxHp) { G.ui.toast('이미 건강해요!'); return; }
            if (G.save.useItem(id)) { p.hp = Math.min(p.maxHp, p.hp + 20); G.save.write('potion'); draw(); }
          } else if (id === 'dex') await openPokedex();
          else if (id === 'stamp_card') await openDailyPlan();
          else G.ui.toast(ITEM_DESC[id]);
        });
        body.append(el('div', { class: 'item-row' }, b, el('p', {}, ITEM_DESC[id])));
      }
    }; draw();
  }, null);
}
export async function openTrainerCard(): Promise<void> {
  await screen('트레이너 카드', body => {
    const d = G.save.data;
    body.append(playerPortrait(d.player.appearance, 'front', 96), el('h2', {}, d.player.name), el('p', {}, `용돈 ₩${d.player.money} · 공부 도장 ${G.learn.stage()}개`),
      el('p', {}, `잡은 포켓몬 ${d.dex.caught.length}마리 · 정답 ${d.stats.correct}개`), el('p', {}, `모험한 시간 ${Math.floor(d.playTimeSec / 60)}분`));
    if (d.player.badges.includes('boulder')) body.append(el('img', { class: 'badge', src: asset('assets/img/badge_boulder.png'), alt: '회색배지' }));
    else body.append(el('p', {}, '회색체육관에서 첫 배지에 도전해 보세요.'));
  }, null);
}
export async function openDailyPlan(): Promise<void> {
  await screen('오늘의 공부', body => {
    const draw = () => {
      G.learn.rollover(); const plan = G.learn.plan();
      body.replaceChildren(el('p', {}, `공부 도장 ${G.learn.stage()}개 · 오늘도 한 걸음!`));
      for (const s of ['math', 'english'] as Subject[]) {
        const p = plan[s]; if (p.state === 'disabled') continue;
        const active = p.state === 'active';
        body.append(el('section', { class: 'study-card' }, el('h2', {}, s === 'math' ? '🔢 수학' : '🔤 영어'),
          el('p', {}, p.lesson?.title || '모든 공부를 마쳤어요!'), el('p', {}, active ? `${p.correct} / ${p.required}개 정답` : '오늘의 공부 완료! 더 풀면 복습해요.'),
          button(active ? '공부하기' : '복습하기', async () => { await G.learn.quiz({ purpose: 'practice', subject: s }); G.save.write('study'); draw(); })));
      }
      if (plan.allDoneToday) body.append(el('p', {}, '🎉 오늘의 공부를 모두 마쳤어요!'));
    }; draw();
  }, null);
}
export function openCustomize(mode: 'intro' | 'mirror'): Promise<PlayerAppearance> {
  const appearance = { ...G.save.data.player.appearance };
  return screen('나의 모습', (body, done) => {
    const preview = el('div', { class: 'appearance-preview' });
    const draw = () => preview.replaceChildren(playerPortrait(appearance, 'front', 128)); draw();
    body.append(preview);
    const options: [keyof PlayerAppearance, string, (string | boolean | number)[], string[]][] = [
      ['gender', '모습', ['boy', 'girl'], ['남자아이', '여자아이']], ['skin', '피부', [0, 1, 2], ['밝은 피부', '중간 피부', '어두운 피부']],
      ['hairColor', '머리색', [0, 1, 2, 3, 4, 5], ['검정', '갈색', '노랑', '빨강', '파랑', '초록']],
      ['hairStyle', '머리 모양', [0, 1, 2], HAIR_STYLE_NAMES[appearance.gender]], ['outfit', '옷 색', [0, 1, 2, 3, 4, 5], ['빨강', '파랑', '초록', '주황', '보라', '분홍']], ['hat', '모자', [true, false], ['쓰기', '벗기']],
    ];
    for (const [key, title, values, labels] of options) {
      const select = el('select', { 'aria-label': title }, ...values.map((v, i) => el('option', { value: String(i) }, labels[i])));
      select.value = String(values.indexOf(appearance[key]));
      select.onchange = () => { Object.assign(appearance, { [key]: values[Number(select.value)] }); draw(); };
      body.append(el('label', { class: 'setting' }, title, select));
    }
    body.append(button('이 모습으로 결정', () => done(appearance), 'primary'));
  }, mode === 'mirror' ? G.save.data.player.appearance : undefined);
}
export function openNameEntry(title: string, suggestions: string[], initial?: string, maxLen = 8, cancellable = false): Promise<string> {
  return screen(title, (body, done) => {
    const text = el('input', { type: 'text', value: initial || suggestions[0], maxlength: maxLen, 'aria-label': title, autocomplete: 'off' });
    const submit = () => { const name = text.value.trim().slice(0, maxLen); if (name) done(name); else text.focus(); };
    text.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submit(); } });
    body.append(text, el('div', { class: 'menu-grid' }, ...suggestions.map(name => button(name, () => { text.value = name; }))), button('결정', submit, 'primary'));
  }, cancellable ? '' : undefined);
}
export async function openParentArea(): Promise<void> {
  const a = 10 + Math.floor(Math.random() * 80), b = 2 + Math.floor(Math.random() * 8);
  const allowed = await screen('보호자 확인', (body, done) => {
    const answer = el('input', { type: 'text', inputmode: 'numeric', pattern: '[0-9]*', 'aria-label': `${a} 곱하기 ${b}` });
    const status = el('p', { role: 'status' });
    body.append(el('p', {}, `${a} × ${b} = ?`), answer, button('확인', () => { if (Number(answer.value) === a * b) done(true); else status.textContent = '계산한 답을 다시 입력해 주세요.'; }), status);
  }, false);
  if (!allowed) return;
  await screen('보호자 메뉴', body => {
    const d = G.save.data, parent = d.learn.parent;
    const setting = (title: string, values: string[], selected: number, change: (i: number) => number | void) => {
      const select = el('select', { 'aria-label': title }, ...values.map((v, i) => el('option', { value: String(i) }, v)));
      select.value = String(selected); select.onchange = () => { const value = change(Number(select.value)); if (value !== undefined) select.value = String(value); G.save.write('settings'); };
      body.append(el('label', { class: 'setting' }, title, select));
    };
    setting('하루 진도량', ['제한 없음', '1레슨', '2레슨', '3레슨'], parent.pace, i => { parent.pace = i as 0 | 1 | 2 | 3; });
    for (const s of ['math', 'english'] as Subject[]) {
      setting(s === 'math' ? '수학 사용' : '영어 사용', ['끄기', '켜기'], Number(parent.subjects[s]), i => {
        parent.subjects[s] = !!i;
        if (!parent.subjects.math && !parent.subjects.english) { parent.subjects[s] = true; G.ui.toast('한 과목 이상 켜 주세요.'); }
        return Number(parent.subjects[s]);
      });
      const lessons = G.learn.curriculum().lessons.filter(l => l.subject === s);
      const select = el('select', { 'aria-label': `${s === 'math' ? '수학' : '영어'} 시작 진도` }, ...lessons.map(l => el('option', { value: l.order }, `${l.grade}-${l.semester} ${G.learn.unit(l.unitId)?.title} · ${l.title}`)));
      select.value = String(G.learn.lesson(d.learn.subjects[s].current || '')?.order || 1);
      body.append(el('label', { class: 'setting' }, `${s === 'math' ? '수학' : '영어'} 시작 진도`, select), button('시작 진도 적용', async () => {
        if (await G.ui.yesNo('이전 레슨은 완료로 표시됩니다. 진도를 바꿀까요?')) { G.learn.setStart(s, Number(select.value)); G.ui.toast('진도를 바꿨어요.'); }
      }));
    }
    setting('문제 읽어주기', ['끄기', '켜기'], Number(parent.ttsQuestions), i => { parent.ttsQuestions = !!i; });
    setting('대사 읽어주기', ['끄기', '켜기'], Number(parent.ttsDialog), i => { parent.ttsDialog = !!i; });
    for (const [key, label] of [['music', '음악 음량'], ['sfx', '효과음 음량']] as const) {
      const range = el('input', { type: 'range', min: 0, max: 1, step: .1, value: d.settings[key], 'aria-label': label });
      range.oninput = () => { d.settings[key] = Number(range.value); G.audio.setVolumes(d.settings.music, d.settings.sfx); G.save.write('volume'); };
      body.append(el('label', { class: 'setting' }, label, range));
    }
    body.append(button('학습 리포트', () => report()), button('문제 미리보기', () => { window.open(asset('questions.html'), '_blank', 'noopener'); }),
      button('이어하기 코드 만들기', async () => { G.save.write('transfer'); const code = await G.net.createTransferCode(); await G.ui.say(code ? `이어하기 코드: ${code}` : '온라인 연결이 필요합니다. 이 기기에는 모험이 저장되어 있어요.'); }),
      button('이어하기 코드 입력', async () => {
        const code = await openNameEntry('이어하기 코드', [], '', 6, true);
        if (!code || !await G.ui.yesNo('이 기기의 모험을 코드에 담긴 모험으로 바꿀까요?')) return;
        const raw = await G.net.claimTransferCode(code.trim().toUpperCase());
        const repaired = repairSave(raw);
        if (!repaired) { G.ui.toast('코드를 확인하거나 온라인에서 다시 시도해 주세요.'); return; }
        G.save.data = repaired; G.save.write('transfer'); location.reload();
      }), button('저장 데이터 초기화', async () => {
        if (!await G.ui.yesNo('이 기기의 모험을 지울까요?')) return;
        if (!await G.ui.yesNo('포켓몬과 공부 기록을 되돌릴 수 없어요. 정말 지울까요?')) return;
        G.save.newGame(); location.reload();
      }, 'danger'));
  }, null);
}
async function report(): Promise<void> {
  const mistakes = await Promise.all([...new Set(G.save.data.learn.mistakes)].slice(-10).reverse().map(async id => {
    const qs = await G.learn.questionsForLesson(id.replace(/-\d+$/, '')); return qs.find(q => q.id === id);
  }));
  await screen('학습 리포트', body => {
    const d = G.save.data;
    body.append(el('p', {}, `연속 공부 ${d.learn.streak.days}일 · 정답 ${d.stats.correct}개`));
    for (const u of G.learn.curriculum().units) {
      const stats = G.learn.curriculum().lessons.filter(l => l.unitId === u.id).map(l => d.learn.subjects[l.subject].lessonStats[l.id] || { c: 0, w: 0 });
      const c = stats.reduce((s, x) => s + x.c, 0), total = stats.reduce((s, x) => s + x.c + x.w, 0);
      if (!total) continue;
      body.append(el('label', { class: 'report-row' }, `${u.grade}-${u.semester} ${u.title} · ${Math.round(c / total * 100)}%`, el('progress', { value: c, max: total })));
    }
    body.append(el('h2', {}, '최근 다시 볼 문제'));
    for (const q of mistakes) if (q) body.append(button(q.prompt, () => G.learn.ask(q, { purpose: 'practice' })));
  }, null);
}
export async function openShop(items: { item: ItemId; price: number }[]): Promise<void> {
  await screen('프렌들리숍', body => {
    const draw = () => {
      body.replaceChildren(el('p', {}, `용돈 ₩${G.save.data.player.money}`));
      for (const { item, price } of items) body.append(button(`${ITEM_NAMES[item]} · ₩${price}`, () => {
        if (G.save.data.player.money < price) { G.ui.toast('용돈이 부족해요. 공부 도장을 모아 보세요.'); return; }
        G.save.addMoney(-price); G.save.addItem(item); G.save.write('shop'); G.audio.playSfx('coin'); draw();
      }));
    }; draw();
  }, null);
}
export async function openPC(): Promise<void> {
  await screen('포켓몬 PC', body => {
    const draw = () => {
      const d = G.save.data; body.replaceChildren(el('h2', {}, '함께 다니는 친구'));
      d.party.forEach((p, i) => body.append(button(`${p.nickname || G.data.speciesById(p.speciesId).name} 맡기기`, () => {
        if (d.party.length <= 1 || !d.party.some((other, j) => j !== i && other.hp > 0)) { G.ui.toast('건강한 친구 한 마리는 함께 있어야 해요.'); return; }
        d.box.push(...d.party.splice(i, 1)); G.save.write('pc'); draw();
      })));
      body.append(el('h2', {}, `맡긴 친구 ${d.box.length}마리`));
      d.box.forEach((p, i) => body.append(button(`${p.nickname || G.data.speciesById(p.speciesId).name} 데려오기`, () => {
        if (d.party.length >= 6) { G.ui.toast('함께 다니는 친구는 여섯 마리까지예요.'); return; }
        d.party.push(...d.box.splice(i, 1)); G.save.write('pc'); draw();
      })));
    }; draw();
  }, null);
}
function pickPokemon(title: string, options: number[]): Promise<number> {
  return screen(title, (body, done) => {
    const grid = el('div', { class: 'picker-grid' });
    for (const id of options) {
      const s = G.data.speciesById(id), b = button(`${s.name} · ${s.types.join('/')}`, async () => {
        G.audio.playCry(id); if (await G.ui.yesNo(`${josa(s.name, '으로/로')} 결정할까요?`)) done(id);
      }); b.prepend(pokemonSprite(id)); grid.append(b);
    }
    body.append(grid);
  });
}
export function pickStarter(options: number[] = STARTERS): Promise<number> { return pickPokemon('첫 친구를 골라 주세요', options); }
export function pickEvolution(options: number[]): Promise<number> { return pickPokemon('어떤 모습으로 자랄까요?', options); }
export async function showBadge(_badgeId: string): Promise<void> {
  await screen('회색배지를 받았어요!', (body, done) => {
    body.append(el('img', { class: 'badge badge-reveal', src: asset('assets/img/badge_boulder.png'), alt: '회색배지' }), el('p', {}, '매일 공부한 힘이 모여 멋진 배지가 되었어요!'), button('모험 계속하기', () => done(null), 'primary'));
    void G.audio.jingle('badge');
  });
}
