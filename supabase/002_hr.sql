-- Миграция 002: управленка — сотрудники, оргструктура, регламенты, процессы, график поддержки,
-- и переход с открытого доступа на вход по email/паролю (Supabase Auth).
-- Выполнить один раз в SQL Editor ПОСЛЕ schema.sql.

-- ============================================================
-- 1. Кто имеет доступ. role: admin — правит всё, viewer — только смотрит.
--    Аккаунты создаются в Authentication → Users → Add user (с паролем, auto confirm).
--    Сюда нужно внести те же email, иначе после входа пользователь ничего не увидит.
-- ============================================================
create table if not exists public.allowed_users (
  email        text primary key,
  role         text not null default 'viewer' check (role in ('admin','viewer')),
  employee_id  text,
  created_at   timestamptz not null default now()
);

create or replace function public.current_role_level()
returns text language sql stable security definer set search_path = public as $$
  select role from public.allowed_users where lower(email) = lower(auth.email()) limit 1
$$;
create or replace function public.is_allowed()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.allowed_users where lower(email) = lower(auth.email()))
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.allowed_users where lower(email) = lower(auth.email()) limit 1), false)
$$;

alter table public.allowed_users enable row level security;
drop policy if exists "allowed read own or admin" on public.allowed_users;
drop policy if exists "admin manage allowed"      on public.allowed_users;
create policy "allowed read own or admin" on public.allowed_users for select to authenticated
  using (lower(email) = lower(auth.email()) or public.is_admin());
create policy "admin manage allowed" on public.allowed_users for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 2. Справочники и сотрудники
-- ============================================================
create table if not exists public.departments (
  id        text primary key,
  name      text not null,
  mission   text,
  head_id   text,
  sort      integer not null default 100
);

create table if not exists public.employees (
  id              text primary key,
  full_name       text not null,
  short_name      text,
  title           text,
  department_id   text references public.departments(id),
  manager_id      text references public.employees(id),
  status          text not null default 'active' check (status in ('active','former','contractor')),
  contract_type   text check (contract_type in ('ТК','ГПХ','СЗ','ИП')),
  hired_at        date,
  left_at         date,
  work_mode       text,
  support_role    text check (support_role in ('line','senior')),
  email           text,
  phone           text,
  telegram        text,
  birthday        date,
  city            text,
  gpx_link        text,
  job_desc_link   text,
  job_purpose     text,
  duties          text[] not null default '{}',
  kpis            text[] not null default '{}',
  notes           text,
  updated_at      timestamptz not null default now()
);

create table if not exists public.regulations (
  id              uuid primary key default gen_random_uuid(),
  code            text,
  title           text not null,
  description     text,
  link            text,
  version         text,
  updated_on      date,
  owner_dept_id   text references public.departments(id),
  departments     text[] not null default '{}',   -- к каким отделам относится; пусто = ко всем
  sort            integer not null default 100
);

create table if not exists public.processes (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  goal            text,
  trigger_text    text,
  steps           text,            -- по шагу на строку
  owner_id        text references public.employees(id),
  department_id   text references public.departments(id),
  participants    text[] not null default '{}',  -- employee ids
  metric          text,
  constraint_note text,            -- где ограничение (ТОС)
  systems         text,
  link            text,            -- схема BPMN / Miro / Notion
  sort            integer not null default 100
);

create table if not exists public.support_shifts (
  day          date not null,
  employee_id  text not null references public.employees(id),
  kind         text not null check (kind in ('line','senior')),
  primary key (day, employee_id)
);

-- updated_at на сотрудниках
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists employees_touch on public.employees;
create trigger employees_touch before update on public.employees
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 3. Доступ: читать могут все вошедшие из allowed_users, править — только admin
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['departments','employees','regulations','processes','support_shifts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "allowed read" on public.%I', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "allowed read" on public.%I for select to authenticated using (public.is_allowed())', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Реестр выплат: закрываем от anon, открываем только admin (зарплаты видит только руководитель)
drop policy if exists "anon read state"   on public.payroll_state;
drop policy if exists "anon insert state" on public.payroll_state;
drop policy if exists "anon update state" on public.payroll_state;
drop policy if exists "anon read history" on public.payroll_state_history;
drop policy if exists "admin all state"   on public.payroll_state;
drop policy if exists "admin read history" on public.payroll_state_history;
create policy "admin all state" on public.payroll_state for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin read history" on public.payroll_state_history for select to authenticated
  using (public.is_admin());

-- Представления из schema.sql были доступны anon — отзываем
revoke select on public.payroll_schedule, public.payroll_month_status from anon;
grant  select on public.payroll_schedule, public.payroll_month_status to authenticated;

-- Realtime для новых таблиц
alter publication supabase_realtime add table public.employees;
alter publication supabase_realtime add table public.departments;
alter publication supabase_realtime add table public.support_shifts;
alter publication supabase_realtime add table public.regulations;
alter publication supabase_realtime add table public.processes;
