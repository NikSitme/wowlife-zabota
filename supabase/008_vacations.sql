-- График отпусков. Выполнить один раз в SQL Editor (повторный запуск безопасен).
-- Заодно — колонка испытательного срока из 006_probation.sql (если её ещё нет).

alter table public.employees add column if not exists probation_end date;
-- Неиспользованные дни отпуска, перенесённые с прошлого года (в таблице отпусков — «Остаток»)
alter table public.employees add column if not exists vacation_carryover int not null default 0;

create table if not exists public.vacations (
  id           uuid primary key default gen_random_uuid(),
  employee_id  text not null references public.employees(id) on delete cascade,
  start_date   date not null,
  end_date     date not null,
  kind         text not null default 'отпуск' check (kind in ('отпуск','за свой счёт','больничный','учёба')),
  status       text not null default 'план' check (status in ('план','согласован')),
  approx       boolean not null default false, -- даты условные: в исходной таблице было только число дней за месяц
  note         text,
  created_at   timestamptz not null default now(),
  check (end_date >= start_date)
);
create index if not exists vacations_emp_idx on public.vacations (employee_id, start_date);

-- Доступ — как у остальных таблиц управленки
alter table public.vacations enable row level security;
drop policy if exists "allowed read" on public.vacations;
drop policy if exists "admin write" on public.vacations;
create policy "allowed read" on public.vacations for select to authenticated using (public.is_allowed());
create policy "admin write" on public.vacations for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Режим без входа (как 004_open_access.sql); при включении входа политику убрать (005_close_access.sql)
drop policy if exists "open anon all" on public.vacations;
create policy "open anon all" on public.vacations for all to anon using (true) with check (true);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'vacations') then
    alter publication supabase_realtime add table public.vacations;
  end if;
end $$;

notify pgrst, 'reload schema';
