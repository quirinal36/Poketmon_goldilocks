import { test, expect } from '@playwright/test';
import { defaultSave } from '../../src/core/save';

const api = 'https://auth-test.supabase.co';
const userId = '11111111-1111-4111-8111-111111111111';

for (const loginMode of ['kakao', 'password']) test(`${loginMode}: login, isolated save restore and logout`, async ({ page }) => {
  let cloud = defaultSave();
  let failWrites = false;
  cloud.flags.intro_done = true;
  cloud.pos = { map: 'pallet', x: 11, y: 14, facing: 'down' }; cloud.player.name = '카카오'; cloud.updatedAt = '2026-01-01T00:00:00Z';
  const guest = defaultSave(); guest.player.name = '게스트';
  const user = { id: userId, is_anonymous: false, aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'kakao' }, user_metadata: {} };
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })}.test`;
  let authorize: URL | undefined;
  let exchange: Record<string, string> | undefined;
  const profiles: string[] = [];
  await page.route('**/config.js', route => route.fulfill({ contentType: 'application/javascript', body: `window.__APP_CONFIG__ = ${JSON.stringify({ supabaseUrl: api, supabaseAnonKey: 'test-public-key' })}` }));
  await page.route(`${api}/**`, async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.pathname.endsWith('/authorize')) {
      authorize = url;
      return route.fulfill({ contentType: 'text/html', body: 'Mock Kakao consent' });
    }
    if (url.pathname.endsWith('/token')) {
      exchange = req.postDataJSON();
      if (url.searchParams.get('grant_type') === 'password' && exchange?.password !== 'test-password') return route.fulfill({ status: 400, json: { error_code: 'invalid_credentials', msg: 'Invalid credentials' } });
      return route.fulfill({ json: { access_token: token, refresh_token: 'test-refresh', expires_in: 3600, token_type: 'bearer', user } });
    }
    if (url.pathname.endsWith('/user')) return route.fulfill({ json: user });
    if (url.pathname.endsWith('/signup')) return route.fulfill({ status: 422, json: { code: 'anonymous_provider_disabled', msg: 'disabled' } });
    if (url.pathname.endsWith('/profiles')) {
      expect(req.headers()['accept-profile']).toBe('public');
      expect(url.searchParams.get('id')).toBe(`eq.${userId}`);
      expect(url.searchParams.get('select')).toBe('display_name');
      return route.fulfill({ json: { display_name: '라운지 학생' } });
    }
    if (url.pathname.startsWith('/rest/')) {
      profiles.push(req.headers()['accept-profile'] || req.headers()['content-profile']);
      if (url.pathname.endsWith('/players') && req.method() === 'POST') {
        if (failWrites) return route.fulfill({ status: 503, json: { message: 'save unavailable' } });
        cloud = req.postDataJSON().save;
      }
      return route.fulfill({ json: url.pathname.endsWith('/players') && req.method() === 'GET' ? { save: cloud } : [] });
    }
    return route.fulfill({ status: 204 });
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: '카카오 로그인', exact: true })).toBeVisible();
  await page.evaluate(save => localStorage.setItem('pokestudy.save.v1', JSON.stringify(save)), guest);
  if (loginMode === 'kakao') {
    await page.getByRole('button', { name: '카카오 로그인', exact: true }).click();
    await expect.poll(() => authorize?.searchParams.get('provider')).toBe('kakao');
    expect(authorize!.searchParams.get('code_challenge_method')).toBe('s256');
    const redirect = authorize!.searchParams.get('redirect_to')!;
    await page.goto(`${redirect}?code=test-code&debug=1`);
    await expect(page.getByRole('button', { name: '로그아웃', exact: true })).toBeVisible();
    expect(exchange?.auth_code).toBe('test-code');
    expect(exchange?.code_verifier).toBeTruthy();
  } else {
    await page.goto('/?debug=1');
    await page.getByRole('button', { name: '라운지 계정 로그인', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: '라운지 계정 로그인', exact: true });
    await dialog.getByLabel('이메일 (라운지 아이디)', { exact: true }).fill('student@example.com');
    await dialog.getByLabel('비밀번호', { exact: true }).fill('wrong');
    await dialog.getByRole('button', { name: '로그인', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('이메일 또는 비밀번호를 확인');
    await expect(dialog.getByLabel('비밀번호', { exact: true })).toHaveValue('');
    await dialog.getByLabel('비밀번호', { exact: true }).fill('test-password');
    await dialog.getByLabel('비밀번호', { exact: true }).press('Enter');
    await expect(page.getByRole('button', { name: '로그아웃', exact: true })).toBeVisible();
    expect(exchange).toMatchObject({ email: 'student@example.com', password: 'test-password' });
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('test-password');
  }
  await expect(page.getByRole('button', { name: '이어서 하기', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as any).__G.save.data.player.name)).toBe('카카오');
  await expect(page.getByRole('status')).toHaveText('라운지 학생님 계정으로 로그인했어요.');
  expect(profiles.length).toBeGreaterThan(0);
  expect(profiles.every(schema => schema === 'pokedu')).toBe(true);
  await page.getByRole('button', { name: '이어서 하기', exact: true }).click();
  await page.getByRole('button', { name: '메뉴', exact: true }).waitFor();
  await page.evaluate(async () => {
    const g = (window as any).__G;
    await g.world.movePlayer(['right']);
    g.save.data.player.money = 2345;
    g.save.data.bag.potion = 7;
    g.save.data.dex.caught = [25, 158];
    g.save.data.flags.saved_progress = true;
    g.save.data.learn.subjects.math.completed['m11-u1-l1'] = '2026-09-30';
  });
  await page.getByRole('button', { name: '메뉴', exact: true }).click();
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('이 기기와 계정에 저장했어요');
  expect(cloud).toMatchObject({
    pos: { map: 'pallet', x: 12, y: 14 }, player: { money: 2345 }, bag: { potion: 7 },
    dex: { caught: [25, 158] }, flags: { saved_progress: true },
    learn: { subjects: { math: { completed: { 'm11-u1-l1': '2026-09-30' } } } },
  });
  failWrites = true;
  await page.evaluate(() => { (window as any).__G.save.data.player.money = 3456; });
  await page.getByRole('button', { name: '저장하기', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('계정 저장은 아직 완료되지 않았어요');
  expect(cloud.player.money).toBe(2345);
  failWrites = false;
  // Page-exit save must flush the latest snapshot, including changes after manual save.
  await page.evaluate(() => {
    (window as any).__G.save.data.player.money = 4567;
    window.dispatchEvent(new Event('pagehide'));
  });
  await expect.poll(() => cloud.player.money).toBe(4567);
  // With this account's local save absent, restore from the confirmed server save.
  await page.evaluate(id => localStorage.removeItem(`pokestudy.save.v1:${id}`), userId);
  await page.goto('/?debug=1');
  await expect(page.getByRole('button', { name: '이어서 하기', exact: true })).toBeVisible();
  await expect(page.getByText(/마지막 저장/)).toBeVisible();
  expect(await page.evaluate(() => (window as any).__G.save.data)).toMatchObject({
    player: { money: 4567 }, pos: { map: 'pallet', x: 12, y: 14 }, bag: { potion: 7 }, flags: { saved_progress: true },
  });
  await page.getByRole('button', { name: '로그아웃', exact: true }).click();
  await expect(page.getByRole('button', { name: '카카오 로그인', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as any).__G.save.data.player.name)).toBe('게스트');
});

test('cancelled login shows a recoverable error', async ({ page }) => {
  await page.route('**/config.js', route => route.fulfill({ contentType: 'application/javascript', body: `window.__APP_CONFIG__ = ${JSON.stringify({ supabaseUrl: api, supabaseAnonKey: 'test-public-key' })}` }));
  await page.route(`${api}/**`, route => route.fulfill({ status: 400, json: { msg: 'cancelled' } }));
  await page.goto('/?error=access_denied&error_description=cancelled');
  await expect(page.getByRole('status')).toContainText('로그인을 완료하지 못했어요');
  await expect(page.getByRole('button', { name: '카카오 로그인', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: '새로 시작', exact: true })).toBeEnabled();
});
