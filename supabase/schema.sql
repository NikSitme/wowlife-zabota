-- Схема базы для дашборда «Реестр выплат — Забота».
-- Выполнить один раз в Supabase: SQL Editor → New query → вставить → Run.

-- Текущее состояние дашборда: один документ (id = 'zabota') со всем реестром в jsonb.
create table if not exists public.payroll_state (
  id          text primary key,
  state       jsonb not null,
  version     integer not null default 1,
  updated_at  timestamptz not null default now()
);

-- История: каждая перезапись состояния сохраняет предыдущую версию — для отката.
create table if not exists public.payroll_state_history (
  id          bigint generated always as identity primary key,
  doc_id      text not null,
  version     integer not null,
  state       jsonb not null,
  saved_at    timestamptz not null default now()
);

create or replace function public.payroll_state_keep_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.payroll_state_history (doc_id, version, state, saved_at)
  values (old.id, old.version, old.state, old.updated_at);
  return new;
end $$;

drop trigger if exists payroll_state_history_trg on public.payroll_state;
create trigger payroll_state_history_trg
  before update on public.payroll_state
  for each row execute function public.payroll_state_keep_history();

-- Доступ. Авторизации в дашборде нет: anon-ключ читает и пишет текущее состояние,
-- историю может только читать (удалять и менять её из браузера нельзя).
alter table public.payroll_state enable row level security;
alter table public.payroll_state_history enable row level security;

drop policy if exists "anon read state"   on public.payroll_state;
drop policy if exists "anon insert state" on public.payroll_state;
drop policy if exists "anon update state" on public.payroll_state;
drop policy if exists "anon read history" on public.payroll_state_history;

create policy "anon read state"   on public.payroll_state for select to anon using (true);
create policy "anon insert state" on public.payroll_state for insert to anon with check (true);
create policy "anon update state" on public.payroll_state for update to anon using (true) with check (true);
create policy "anon read history" on public.payroll_state_history for select to anon using (true);

-- Realtime: чтобы правки одного человека сразу появлялись у остальных.
alter publication supabase_realtime add table public.payroll_state;

-- Удобные представления для SQL-запросов по реестру (строки графика выплат и статусы месяцев).
create or replace view public.payroll_schedule as
select r.*
from public.payroll_state s,
     jsonb_to_recordset(s.state->'schedule')
       as r(id text, emp text, date date, amount numeric, type text, paid boolean, note text, month text)
where s.id = 'zabota';

create or replace view public.payroll_month_status as
select m.key as month, m.value #>> '{}' as status
from public.payroll_state s, jsonb_each(s.state->'monthStatus') m
where s.id = 'zabota';

grant select on public.payroll_schedule, public.payroll_month_status to anon;
