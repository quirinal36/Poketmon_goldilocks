# 배포 안내서 — 포켓몬 공부 대모험

> 학원 선생님이 혼자서도 따라 할 수 있도록 순서대로 적었습니다.
> 명령은 모두 이 저장소 폴더(`my_game/`)에서 터미널에 입력합니다.

## 카카오 로그인 · pokedu (현재 구성)

운영 도메인: **https://poke.letscoding.kr** · Vercel 프로젝트: `letscodings-projects/poke-du`.

현재 GitHub 저장소는 [quirinal36/Poketmon_goldilocks](https://github.com/quirinal36/Poketmon_goldilocks)이며, Vercel 프로젝트의 Git 연결도 이 저장소의 `main`으로 설정되어 있습니다. 저장소 이름을 바꿀 때에는 Vercel의 Git 연결을 새 저장소 주소로 다시 연결해야 다음 push가 자동 배포됩니다.

Cloudflare DNS 연결값 (2026-09-30 Vercel 확인):

| 유형 | 이름 | 값 | 프록시 |
|---|---|---|---|
| CNAME | `poke` | `e478339c04838165.vercel-dns-017.com` | DNS only |
| TXT | `_vercel` | `vc-domain-verify=poke.letscoding.kr,6ee2c2530ee80d6a4251` | 해당 없음 |

기존 `_vercel` TXT 레코드는 유지하고 위 값을 별도로 추가합니다. DNS 저장 후 Vercel 프로젝트 Domains에서 `poke.letscoding.kr`을 Verify합니다. 임시 배포 주소는 https://poke-du.vercel.app 이며, 카카오 로그인 복귀 주소는 운영 도메인으로 등록되어 있습니다.

`.env.local`의 `SUPABASE_PROJECT_URL`과 `SUPABASE_ANON_KEY`를 그대로 사용합니다. Vite는 이 두 공개 값만 브라우저에 넣습니다. `SUPABASE_DB_PASSWORD`는 포함하지 않습니다. 기존 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`도 지원하며, 명시적으로 빈 값을 지정하면 오프라인 빌드가 됩니다.

- **라운지 계정 로그인**은 lounge.letscoding.kr과 동일한 Supabase Auth 프로젝트에 기존 이메일·비밀번호로 로그인합니다. 별도 회원가입이나 비밀번호 복사 없이 같은 사용자 ID의 `pokedu` 저장을 불러옵니다. 비밀번호는 저장하지 않습니다.
- 시작 화면의 **카카오 로그인** → 카카오 동의 → 같은 게임 경로로 복귀합니다. PKCE 코드 교환과 세션 유지는 Supabase SDK가 처리합니다.
- 로그인 없이도 기기 저장으로 플레이할 수 있습니다. 카카오 계정과 게스트의 저장은 분리되며, 기존 게스트 진행을 계정에 자동으로 덮어쓰지 않습니다. 로그아웃하면 게스트 저장으로 돌아옵니다.
- 인증 계정은 Supabase의 `auth.users`, 게임 테이블과 RPC는 **`pokedu`** 스키마를 사용합니다. 각 계정은 RLS로 자기 저장과 학습 기록만 접근합니다.
- 스키마 SQL: `supabase/migrations/20260930000000_pokedu.sql`. 공유 Supabase 프로젝트에는 아래 파일만 적용하세요. 기존 초기 마이그레이션은 `public` 스키마용이므로 전체 `db push` 또는 `config push`로 다른 서비스 설정을 바꾸지 마세요.
  ```sh
  supabase db query --linked --file supabase/migrations/20260930000000_pokedu.sql
  ```
  이미 적용한 프로젝트에서는 재실행하지 않습니다.
- Supabase Data API의 Exposed schemas에 기존 목록을 유지하며 `pokedu`를 추가합니다.
- Auth → URL Configuration의 Redirect URLs에 운영 주소 `https://poke.letscoding.kr/`, 개발용 `http://localhost:5173/`, 미리보기용 `http://localhost:4173/`를 등록합니다. 공유 프로젝트의 Site URL은 다른 서비스에서도 사용하므로 변경하지 않습니다.
- 현재 공유 프로젝트는 이메일 없는 로그인을 허용하지 않으므로 Supabase 카카오 공급자의 기본 범위(`account_email` 포함)를 사용합니다. Kakao Developers에서 해당 동의 항목이 활성화되어 있어야 합니다.
- Kakao provider는 켜져 있어야 하며, Kakao Developers의 Redirect URI는 Supabase provider가 안내하는 `https://<project-ref>.supabase.co/auth/v1/callback`입니다.
- 클라우드 교육과정/문제는 선택 사항입니다. 테이블이 비어 있으면 내장 데이터를 사용합니다. 업로드하려면 서버 전용 service-role 키를 추가한 후 `npm run db:seed`를 사용합니다.

참고: [Supabase 카카오 로그인](https://supabase.com/docs/guides/auth/social-login/auth-kakao), [사용자 정의 스키마](https://supabase.com/docs/guides/api/using-custom-schemas).

아래 절은 새 전용 프로젝트를 처음 만드는 경우의 일반 안내입니다. 공유 프로젝트에는 위의 `pokedu` 설정을 우선 적용합니다.

## 0. 한눈에 보기

게임은 **설정이 비어 있으면 그대로 오프라인**으로 동작합니다(문제는 내장, 저장은 기기에). Supabase 주소와 anon 키를 넣으면 클라우드 기능이 켜집니다.

| 배포 방법 | 클라우드 저장 · 문제 갱신 · 학습 기록 · 이어하기 코드 | 비고 |
|---|---|---|
| **Vercel** 에 올리고 그 주소를 사용 | ✅ 모두 동작 | 권장 |
| 렛츠코딩 라운지 → **외부 링크**로 Vercel 주소 등록 | ✅ 모두 동작 | 라운지 목록에서 바로 열림 |
| 렛츠코딩 라운지 → **ZIP 업로드** | ❌ 오프라인 모드 | 라운지 샌드박스 보안 정책(CSP `connect-src 'self'`)이 외부 통신을 막음. 게임은 정상, 저장은 기기에만 |

전체 순서: **Supabase 프로젝트 만들기 → 스키마 올리기 → 익명 로그인 켜기 → 문제 데이터 넣기 → `public/config.js` 채우기 → 빌드 → Vercel 배포 → 라운지 등록**.

## 1. 준비물

- Node.js 20 이상 (`node -v`), 저장소 의존성 설치 완료 (`npm install`)
- Supabase 계정 (https://supabase.com — 무료 요금제로 충분, 무료 프로젝트는 계정당 2개까지)
- Supabase CLI: `npm install -g supabase` (또는 macOS `brew install supabase/tap/supabase`) → `supabase --version`
- Vercel 계정 + CLI: `npm install -g vercel`
- 렛츠코딩 라운지(play.letscoding.kr) 교사 계정

## 2. Supabase 프로젝트 만들기

### 방법 A — 대시보드 (쉬움)
1. https://supabase.com/dashboard → **New project**
2. Name `pokemon-study`, Region **Northeast Asia (Seoul)**, Database password는 만들어서 **꼭 메모** (나중에 `link` 할 때 필요)
3. 1~2분 뒤 프로젝트가 준비됩니다. 주소창의 `https://supabase.com/dashboard/project/<ref>` 에서 `<ref>`(20자 영문)가 **project ref** 입니다.

### 방법 B — CLI
```bash
supabase login                                   # 브라우저가 열리면 승인
supabase orgs list                               # 조직 id 확인
supabase projects create pokemon-study --org-id <org-id> --region ap-northeast-2 --db-password '<비밀번호>'
supabase projects list                           # REFERENCE ID 열이 project ref
```

> 무료 프로젝트 한도(2개)에 걸리면 안 쓰는 프로젝트를 Pause/Delete 하거나 다른 계정을 쓰세요.

## 3. 저장소와 프로젝트 연결

```bash
supabase login
supabase link --project-ref <project-ref>
```
DB 비밀번호를 물어보면 2단계에서 메모한 값을 넣습니다. (환경변수 `SUPABASE_DB_PASSWORD` 가 있으면 묻지 않습니다 — `.env.local` 에 넣어 두었다면 `export SUPABASE_DB_PASSWORD=...` 로 꺼내 쓰세요.)

`supabase/config.toml` 의 `[db] major_version` 이 실제 프로젝트 버전(대시보드 Settings → Infrastructure)과 다르면 경고가 뜹니다. 값만 맞춰 주면 됩니다.

## 4. 스키마 올리기 (`db push`)

```bash
supabase db push
```
`supabase/migrations/20260929000000_init.sql` 이 적용되어 다음이 만들어집니다.

- 표: `units` `lessons` `questions`(공개 읽기), `players`(본인만), `answer_logs`(본인만)
- 함수: `create_transfer_code()` `claim_transfer_code(code)` — 이어하기 코드
- 뷰: `lesson_accuracy` — 차시별 정답률 (본인 기록만)
- 모든 표에 RLS(행 단위 보안)가 켜져 있어 anon 키로는 문제/교육과정 읽기와 본인 세이브·기록만 가능합니다.

확인: 대시보드 **Table Editor** 에 다섯 개 표가 보이면 성공.

## 5. 익명 로그인 켜기

게임은 이메일 없이 **익명 로그인**으로 아이마다 계정을 만듭니다. 기본값은 꺼져 있으므로 반드시 켜야 합니다.

- CLI: `supabase config push` (config.toml 의 `enable_anonymous_sign_ins = true` 가 반영됨. 바뀌는 항목을 보여주고 확인을 묻습니다.)
- 또는 대시보드: **Authentication → Sign In / Providers → Anonymous sign-ins** 를 **ON**

확인: 대시보드 Authentication 설정에서 Anonymous sign-ins 가 켜져 있으면 성공.

## 6. 문제 데이터 넣기 (`db:seed`)

1. 대시보드 **Settings → API** (또는 **Project Settings → API Keys**)에서
   - **Project URL** (`https://xxxx.supabase.co`)
   - **service_role** 키 (새 형식이면 `sb_secret_…`) — **비밀 키입니다. 절대 게임/깃에 넣지 마세요.**
2. 저장소 루트의 `.env.local` 에 적습니다 (이 파일은 `.gitignore` 에 있어 커밋되지 않습니다):
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   (또는 eyJ... 로 시작하는 service_role JWT)
   ```
3. 문제 파일이 최신인지 확인: `npm run data:questions` → `public/data/curriculum.json`, `public/data/questions/*.json`
4. 미리 보기: `npm run db:seed -- --dry-run` (쓰지 않고 개수만 출력)
5. 실행: `npm run db:seed`

스크립트는 `units → lessons → questions` 순서로 500개씩 upsert 하고, 번들에 **없는** 문제는 `is_active=false` 로 숨깁니다(삭제하지 않으므로 학습 기록은 그대로 남습니다). 문제를 고친 뒤에는 `npm run data:questions && npm run db:seed` 를 다시 실행하면 됩니다 — 게임은 다음 접속부터 새 문제를 씁니다.

## 7. 게임 설정 — `public/config.js`

대시보드 **Settings → API** 의 **anon / publishable** 키(`sb_publishable_…` 또는 `eyJ…`)를 넣습니다. 이 키는 브라우저에 공개되어도 되는 키입니다(RLS 가 지켜 줍니다).

```js
window.__APP_CONFIG__ = {
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'sb_publishable_...',
};
```

- **service_role / sb_secret_ 키는 절대 여기 넣지 마세요.**
- 비워 두면 오프라인 모드입니다. 빌드 후에는 `dist/config.js` 만 고쳐도 됩니다(빌드 다시 안 해도 됨).
- 대신 빌드 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 를 써도 됩니다(Vercel 프로젝트 설정 → Environment Variables). `config.js` 가 비어 있을 때만 사용됩니다.

## 8. 빌드와 로컬 확인

```bash
npm run build          # 타입 검사 + dist/ 생성
npm run preview        # http://localhost:4173 에서 확인 (태블릿은 같은 와이파이에서 --host 주소로)
```
브라우저 개발자 도구 콘솔에 `[net] online as …` 가 보이면 클라우드 연결 성공, `[net] offline` 이면 7단계 설정을 다시 확인하세요.

## 9. Vercel 배포

```bash
vercel login
vercel deploy --prod
```
처음 한 번 묻는 항목: 새 프로젝트 → 이름 `pokemon-study` → **Framework Preset: Vite** (자동 감지) → Build Command `npm run build`, Output Directory `dist` (기본값 그대로). 끝나면 `https://pokemon-study-xxxx.vercel.app` 주소가 나옵니다.

- 이 주소를 `supabase/config.toml` 의 `site_url` 에 넣고 `supabase config push` 해 두면 깔끔합니다(필수는 아님).
- 이후 업데이트는 코드 수정 → `vercel deploy --prod` 만 반복.
- Vercel 대시보드에서 GitHub 저장소를 연결해 두면 `git push` 마다 자동 배포됩니다.

## 10. 렛츠코딩 라운지 등록

### 10-A. 외부 링크 (클라우드 기능 전부 사용 — 권장)
라운지 교사 화면 → **웹 게임 등록 → 외부 링크** → 9단계의 Vercel 주소 입력. 아이들은 라운지 목록에서 눌러 새 창/프레임으로 게임을 엽니다.

### 10-B. ZIP 업로드 (오프라인 모드)
```bash
npm run build
npm run zip:lounge     # → pokemon-study-lounge.zip (상대경로, 500개 이하 파일)
```
라운지 → **웹 게임 등록 → ZIP 업로드**. 라운지 샌드박스는 외부 통신을 막으므로(CSP) 게임은 오프라인 모드로 들어갑니다: 내장 문제 + 기기 저장, 이어하기 코드 없음. ZIP 생성 스크립트가 압축 안의 `config.js`를 자동으로 비워 외부 연결 시도를 막습니다.

> 메뉴 이름은 라운지 개편에 따라 조금 다를 수 있습니다. "웹 게임", "외부 링크/URL", "ZIP/파일 업로드" 를 찾으세요.

## 11. 운영 팁

- **이어하기 코드**: 게임 보호자 메뉴 → 이어하기 코드 만들기(6자리, 7일 유효) → 새 기기의 보호자 메뉴에서 입력. 코드는 한 번 쓰면 사라집니다.
- **학습 기록 보기**: 대시보드 SQL Editor 에서
  ```sql
  select p.name, a.lesson_id, a.subject, count(*) answered, count(*) filter (where correct) correct
  from answer_logs a join players p on p.id = a.player_id
  group by 1,2,3 order by 1,2;
  ```
- **백업**: `supabase db dump --data-only -f backup.sql` (players + answer_logs 포함).
- **키가 새어 나갔다면**: 대시보드 Settings → API 에서 키를 **Rotate** 하고 `.env.local`, `public/config.js` 를 갱신해 다시 배포.

## 12. 문제 해결

| 증상 | 원인 / 해결 |
|---|---|
| `supabase link` 에서 비밀번호 오류 | 2단계 DB 비밀번호. 대시보드 Settings → Database → Reset database password |
| `db push` 가 "relation already exists" | 이미 적용된 마이그레이션. `supabase migration list` 로 상태 확인, 필요하면 `supabase migration repair --status applied 20260929000000` |
| 게임 콘솔에 `[net] offline … Anonymous sign-ins are disabled` | 5단계(익명 로그인)가 꺼져 있음 |
| `[net] offline … Failed to fetch` / CSP 경고 | 라운지 ZIP 처럼 외부 통신이 막힌 환경(정상) 또는 URL 오타. Vercel 주소에서 나온다면 `supabaseUrl` 확인 |
| `[net] offline … Invalid API key` | `public/config.js` 의 anon 키 오타, 또는 다른 프로젝트 키 |
| `npm run db:seed` 가 `row-level security` / `permission denied` | `.env.local` 에 anon 키를 넣음. service_role(sb_secret_) 키 필요 |
| `db:seed` 가 `relation "units" does not exist` | 4단계 `supabase db push` 먼저 |
| `db:seed` 가 `curriculum.json 이(가) 없습니다` | `npm run data:questions` 먼저 |
| 문제를 고쳤는데 게임에 반영 안 됨 | `npm run data:questions && npm run db:seed` 다시 실행. 게임은 접속 시 불러옵니다(새로고침) |
| 새 기기에서 세이브가 안 보임 | 익명 계정은 기기·브라우저마다 다릅니다. 이어하기 코드로 옮기세요 |
| 세이브가 옛날 것으로 돌아감 | 클라우드 세이브는 20초마다/화면 이탈 시 올라갑니다. 두 기기에서 동시에 플레이하지 마세요 |
| Vercel 에서 404 / 흰 화면 | Framework Preset 이 Vite 인지, Output Directory 가 `dist` 인지 확인 |

## 13. 보안 체크리스트

- [ ] `public/config.js` 와 Vercel 환경변수에는 **anon/publishable** 키만
- [ ] `service_role` / `sb_secret_` 키는 `.env.local` 에만 (커밋 금지, 채팅/문서 공유 금지)
- [ ] 마이그레이션 SQL 외에 대시보드에서 RLS 를 끄지 않기
- [ ] 아이 이름 외 개인정보를 저장하지 않기 (설계상 이메일·전화번호 없음)
