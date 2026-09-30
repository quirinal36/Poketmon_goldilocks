begin;
create schema if not exists pokedu;

-- ============================================================================
-- 포켓몬 공부 대모험 — pokedu schema (Postgres 15+, Supabase)
-- Applied with `supabase db push`. See docs/DEPLOY.md.
--
-- Tables : units, lessons, questions (public read), players (owner rw),
--          answer_logs (owner insert/select)
-- RPC    : create_transfer_code(), claim_transfer_code(p_code)
-- View   : lesson_accuracy (security_invoker → caller's own logs only)
--
-- The game signs in anonymously (role 'authenticated'); the browser only ever
-- holds the anon/publishable key. RLS is enabled on every table.
-- ============================================================================

-- --------------------------------------------------------------- helpers ----
create or replace function pokedu.set_updated_at()
returns trigger
language plpgsql
set search_path = pokedu
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------- units ----
create table pokedu.units (
  id          text primary key,                                   -- 'm11-u1'
  subject     text not null check (subject in ('math', 'english')),
  grade       smallint not null check (grade in (1, 2)),
  semester    smallint not null check (semester in (1, 2)),
  unit_no     smallint not null,
  title       text not null,
  description text,
  "order"     integer not null,                                   -- global order within subject
  updated_at  timestamptz not null default now()
);
comment on table pokedu.units is '교육과정 단원 (Unit in src/core/types.ts)';

create index units_subject_order_idx on pokedu.units (subject, "order");

create trigger units_set_updated_at
  before update on pokedu.units
  for each row execute function pokedu.set_updated_at();

-- --------------------------------------------------------------- lessons ----
create table pokedu.lessons (
  id               text primary key,                              -- 'm11-u1-l1'
  unit_id          text not null references pokedu.units (id) on delete cascade,
  subject          text not null check (subject in ('math', 'english')),
  grade            smallint not null check (grade in (1, 2)),
  semester         smallint not null check (semester in (1, 2)),
  lesson_no        smallint not null,
  title            text not null,
  goal             text not null default '',
  "order"          integer not null,                              -- global order within subject
  required_correct smallint not null default 8,
  is_review        boolean not null default false,
  updated_at       timestamptz not null default now()
);
comment on table pokedu.lessons is '교육과정 차시 (Lesson in src/core/types.ts)';

create index lessons_subject_order_idx on pokedu.lessons (subject, "order");
create index lessons_unit_id_idx on pokedu.lessons (unit_id);

create trigger lessons_set_updated_at
  before update on pokedu.lessons
  for each row execute function pokedu.set_updated_at();

-- ------------------------------------------------------------- questions ----
create table pokedu.questions (
  id         text primary key,                                    -- 'm11-u1-l1-001'
  lesson_id  text not null references pokedu.lessons (id) on delete cascade,
  subject    text not null check (subject in ('math', 'english')),
  type       text not null default '',
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  data       jsonb not null,                                      -- the full Question object
  is_active  boolean not null default true,
  updated_at timestamptz not null default now()
);
comment on table pokedu.questions is '문제. data = 전체 Question JSON. is_active=false 면 게임에서 숨김.';

create index questions_lesson_id_idx on pokedu.questions (lesson_id);

create trigger questions_set_updated_at
  before update on pokedu.questions
  for each row execute function pokedu.set_updated_at();

-- --------------------------------------------------------------- players ----
create table pokedu.players (
  id                  uuid primary key references auth.users (id) on delete cascade,
  name                text,
  save                jsonb,                                      -- SaveData
  save_updated_at     timestamptz,
  transfer_code       text unique
                      check (transfer_code is null or transfer_code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  transfer_expires_at timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table pokedu.players is '플레이어(카카오 또는 익명 계정) 1명당 1행. save = 클라우드 세이브.';

create trigger players_set_updated_at
  before update on pokedu.players
  for each row execute function pokedu.set_updated_at();

-- ----------------------------------------------------------- answer_logs ----
create table pokedu.answer_logs (
  id          bigint generated always as identity primary key,
  player_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text not null,
  lesson_id   text not null,
  subject     text not null check (subject in ('math', 'english')),
  correct     boolean not null,
  first_try   boolean not null,
  elapsed_ms  integer not null default 0,
  purpose     text not null default 'wild',
  answered_at timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  -- Idempotency key: the client re-sends a batch after a timeout; duplicates are dropped
  -- with `on conflict do nothing` instead of being counted twice.
  unique (player_id, question_id, answered_at)
);
comment on table pokedu.answer_logs is '문제 풀이 기록 (AnswerLog in src/core/types.ts)';

create index answer_logs_player_answered_idx on pokedu.answer_logs (player_id, answered_at desc);

-- ------------------------------------------------------------------- RLS ----
alter table pokedu.units       enable row level security;
alter table pokedu.lessons     enable row level security;
alter table pokedu.questions   enable row level security;
alter table pokedu.players     enable row level security;
alter table pokedu.answer_logs enable row level security;

-- curriculum: readable by everyone (anon key), never writable from the client
create policy "units: public read"
  on pokedu.units for select
  to anon, authenticated
  using (true);

create policy "lessons: public read"
  on pokedu.lessons for select
  to anon, authenticated
  using (true);

create policy "questions: public read (active only)"
  on pokedu.questions for select
  to anon, authenticated
  using (is_active);

-- players: each signed-in user owns exactly the row whose id = auth.uid()
create policy "players: select own"
  on pokedu.players for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "players: insert own"
  on pokedu.players for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "players: update own"
  on pokedu.players for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- answer_logs: append-only for the owner, readable by the owner
create policy "answer_logs: insert own"
  on pokedu.answer_logs for insert
  to authenticated
  with check ((select auth.uid()) = player_id);

create policy "answer_logs: select own"
  on pokedu.answer_logs for select
  to authenticated
  using ((select auth.uid()) = player_id);

-- ---------------------------------------------------------------- grants ----
-- Supabase's default privileges already cover these; stated explicitly so the
-- intent survives a project whose defaults were changed.
grant usage on schema pokedu to anon, authenticated;
grant select on pokedu.units, pokedu.lessons, pokedu.questions to anon, authenticated;
grant select, insert, update on pokedu.players to authenticated;
grant select, insert on pokedu.answer_logs to authenticated;
grant usage on all sequences in schema pokedu to authenticated;

-- ------------------------------------------------------- transfer codes ----
-- 이어하기 코드: 6 chars from an alphabet without look-alikes (no 0/O/1/I),
-- valid for 7 days, stored on the caller's players row.
create or replace function pokedu.create_transfer_code()
returns text
language plpgsql
security definer
set search_path = pokedu
as $$
declare
  v_uid      uuid := auth.uid();
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code     text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  -- make sure the caller has a row to hang the code on
  insert into pokedu.players (id) values (v_uid)
  on conflict (id) do nothing;

  -- free the unique slots held by expired codes
  update pokedu.players
     set transfer_code = null, transfer_expires_at = null
   where transfer_expires_at is not null and transfer_expires_at < now();

  for v_attempt in 1..25 loop
    v_code := '';
    for v_i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;

    if exists (select 1 from pokedu.players where transfer_code = v_code) then
      continue;
    end if;

    begin
      update pokedu.players
         set transfer_code = v_code,
             transfer_expires_at = now() + interval '7 days'
       where id = v_uid;
      return v_code;
    exception when unique_violation then
      -- lost a race for the same code; draw another one
      null;
    end;
  end loop;

  raise exception 'could not allocate a transfer code, try again';
end;
$$;

comment on function pokedu.create_transfer_code() is
  '이어하기 코드 발급. 호출자의 players 행에 7일짜리 6자리 코드를 저장하고 반환.';

-- Claim a code from another device: returns that player's save (or null) and
-- burns the code. The claimer's own row receives a copy so the new device is
-- immediately backed up in the cloud.
create or replace function pokedu.claim_transfer_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = pokedu
as $$
declare
  v_uid  uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_code, '')));
  v_save jsonb;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if v_code !~ '^[A-HJ-NP-Z2-9]{6}$' then
    return null;
  end if;

  update pokedu.players
     set transfer_code = null, transfer_expires_at = null
   where transfer_code = v_code
     and transfer_expires_at is not null
     and transfer_expires_at > now()
  returning save into v_save;

  if not found or v_save is null then
    return null;
  end if;

  insert into pokedu.players (id, name, save, save_updated_at)
  values (v_uid, v_save #>> '{player,name}', v_save, now())
  on conflict (id) do update
    set name = excluded.name,
        save = excluded.save,
        save_updated_at = excluded.save_updated_at;

  return v_save;
end;
$$;

comment on function pokedu.claim_transfer_code(text) is
  '이어하기 코드 사용. 유효한 코드면 그 세이브(jsonb)를 반환하고 코드를 소거. 아니면 null.';

revoke execute on function pokedu.create_transfer_code() from public, anon;
revoke execute on function pokedu.claim_transfer_code(text) from public, anon;
grant execute on function pokedu.create_transfer_code() to authenticated, service_role;
grant execute on function pokedu.claim_transfer_code(text) to authenticated, service_role;

-- ------------------------------------------------------------------ view ----
-- Per-lesson accuracy. security_invoker → the RLS of answer_logs applies to
-- the caller, so each player only ever sees their own aggregates.
create view pokedu.lesson_accuracy
with (security_invoker = true)
as
select
  player_id,
  lesson_id,
  subject,
  (count(*))::integer                              as answered,
  (count(*) filter (where correct))::integer       as correct,
  (count(*) filter (where first_try))::integer     as first_try,
  max(answered_at)                                 as last_answered_at
from pokedu.answer_logs
group by player_id, lesson_id, subject;

comment on view pokedu.lesson_accuracy is '차시별 정답률 (호출자 본인 기록만)';

grant select on pokedu.lesson_accuracy to authenticated;

-- Seed tools use service_role; gameplay remains protected by RLS.
grant usage on schema pokedu to service_role;
grant all on all tables in schema pokedu to service_role;
grant all on all sequences in schema pokedu to service_role;
commit;
