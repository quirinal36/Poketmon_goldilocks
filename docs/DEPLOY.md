# 배포 안내서 — 포켓몬 공부 대모험

> 학원 선생님이 혼자서도 따라 할 수 있도록 순서대로 적었습니다.
> 명령은 모두 이 저장소 폴더(`my_game/`)에서 터미널에 입력합니다.

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
라운지 → **웹 게임 등록 → ZIP 업로드**. 라운지 샌드박스는 외부 통신을 막으므로(CSP) 게임은 자동으로 오프라인 모드로 들어갑니다: 내장 문제 + 기기 저장, 이어하기 코드 없음. 이 경우 `dist/config.js` 를 비워 두고 ZIP 을 만들면 콘솔에 보안 정책 경고도 뜨지 않습니다.

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
