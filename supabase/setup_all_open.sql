-- ВСЁ СРАЗУ для режима без входа: 002_hr.sql + 003_seed_hr.sql + 004_open_access.sql.
-- Выполнить один раз в Supabase → SQL Editor. Повторный запуск безопасен.

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

-- Черновик данных управленки. Выполнить после 002_hr.sql. Всё правится дальше в интерфейсе.
-- Подчинённость и отделы — предположение по реестру выплат и описанию службы поддержки;
-- даты выхода, контакты и документы не заполнены.

insert into public.departments (id, name, mission, head_id, sort) values
  ('mgmt',    'Руководство',    'Стратегия, финансы, операционка.', null, 1),
  ('sales',   'Продажи',        'Ведение лида до покупки, работа с обращениями (Линия 1–2 службы поддержки).', 'galya', 2),
  ('activ',   'Активации',      'Активация сертификатов и запись клиентов к партнёрам (Линия 1–2 службы поддержки).', 'galya', 3),
  ('product', 'Продукт',        'Продукт, партнёры и линейка впечатлений.', 'vasilisa', 4),
  ('admin',   'Администраторы', 'Офис и административные задачи.', null, 5),
  ('mp',      'Маркетплейсы',   'Продажи на маркетплейсах.', 'pavel', 6),
  ('dev',     'Разработка',     'Сайт, интеграции, автоматизация.', 'ilya', 7)
on conflict (id) do nothing;

insert into public.employees (id, full_name, short_name, title, department_id, manager_id, status, support_role) values
  ('nikita',    'Никита',             'Никита',    'Операционный директор',                    'mgmt',    null,       'active', null),
  ('galya',     'Шашкова Галина',     'Галя',      'Руководитель отдела продаж',                'sales',   'nikita',   'active', null),
  ('glafira',   'Шишерина Глафира',   'Глафира',   'Менеджер отдела продаж, старший смены',     'sales',   'galya',    'active', 'senior'),
  ('lena',      'Благородова Лена',   'Лена',      'Менеджер отдела продаж',                    'sales',   'galya',    'active', 'line'),
  ('yana',      'Мамуткина Яна',      'Яна',       'Менеджер по активациям, старший смены',     'activ',   'galya',    'active', 'senior'),
  ('sasha',     'Дергунова Саша',     'Саша',      'Менеджер по активациям',                    'activ',   'galya',    'active', 'line'),
  ('anya',      'Фарукова Анна',      'Аня',       'Менеджер по активациям',                    'activ',   'galya',    'active', 'line'),
  ('vasilisa',  'Василиса',           'Василиса',  'Продакт-менеджер',                          'product', 'nikita',   'active', null),
  ('anastasia', 'Анастасия',          'Анастасия', 'Менеджер по работе с партнёрами',           'product', 'vasilisa', 'active', null),
  ('ekaterina', 'Екатерина',          'Екатерина', 'Младший менеджер',                          'product', 'vasilisa', 'active', null),
  ('marina',    'Марина',             'Марина',    'Администратор',                             'admin',   'nikita',   'active', null),
  ('alina',     'Алина',              'Алина',     'Администратор',                             'admin',   'nikita',   'active', null),
  ('pavel',     'Павел',              'Павел',     'Менеджер по маркетплейсам',                 'mp',      'nikita',   'active', null),
  ('ilya',      'Илья',               'Илья',      'Разработчик',                               'dev',     'nikita',   'active', null),
  ('milana',    'Милана',             'Милана',    'Разовые работы',                            'mgmt',    'nikita',   'former', null)
on conflict (id) do nothing;

-- Смены поддержки на сентябрь 2026 по действующему правилу:
-- первая линия — по декадам один «соло» через день, двое других в паре в остальные дни (по 15 смен);
-- старшие смены — ротация 2/2 (Яна / Глафира).
insert into public.support_shifts (day, employee_id, kind) values
  ('2026-09-01','lena','line'),  ('2026-09-01','anya','line'),
  ('2026-09-02','sasha','line'),
  ('2026-09-03','lena','line'),  ('2026-09-03','anya','line'),
  ('2026-09-04','sasha','line'),
  ('2026-09-05','lena','line'),  ('2026-09-05','anya','line'),
  ('2026-09-06','sasha','line'),
  ('2026-09-07','lena','line'),  ('2026-09-07','anya','line'),
  ('2026-09-08','sasha','line'),
  ('2026-09-09','lena','line'),  ('2026-09-09','anya','line'),
  ('2026-09-10','sasha','line'),
  ('2026-09-11','sasha','line'), ('2026-09-11','anya','line'),
  ('2026-09-12','lena','line'),
  ('2026-09-13','sasha','line'), ('2026-09-13','anya','line'),
  ('2026-09-14','lena','line'),
  ('2026-09-15','sasha','line'), ('2026-09-15','anya','line'),
  ('2026-09-16','lena','line'),
  ('2026-09-17','sasha','line'), ('2026-09-17','anya','line'),
  ('2026-09-18','lena','line'),
  ('2026-09-19','sasha','line'), ('2026-09-19','anya','line'),
  ('2026-09-20','lena','line'),
  ('2026-09-21','sasha','line'), ('2026-09-21','lena','line'),
  ('2026-09-22','anya','line'),
  ('2026-09-23','sasha','line'), ('2026-09-23','lena','line'),
  ('2026-09-24','anya','line'),
  ('2026-09-25','sasha','line'), ('2026-09-25','lena','line'),
  ('2026-09-26','anya','line'),
  ('2026-09-27','sasha','line'), ('2026-09-27','lena','line'),
  ('2026-09-28','anya','line'),
  ('2026-09-29','sasha','line'), ('2026-09-29','lena','line'),
  ('2026-09-30','anya','line'),
  ('2026-09-01','yana','senior'),    ('2026-09-02','yana','senior'),
  ('2026-09-03','glafira','senior'), ('2026-09-04','glafira','senior'),
  ('2026-09-05','yana','senior'),    ('2026-09-06','yana','senior'),
  ('2026-09-07','glafira','senior'), ('2026-09-08','glafira','senior'),
  ('2026-09-09','yana','senior'),    ('2026-09-10','yana','senior'),
  ('2026-09-11','glafira','senior'), ('2026-09-12','glafira','senior'),
  ('2026-09-13','yana','senior'),    ('2026-09-14','yana','senior'),
  ('2026-09-15','glafira','senior'), ('2026-09-16','glafira','senior'),
  ('2026-09-17','yana','senior'),    ('2026-09-18','yana','senior'),
  ('2026-09-19','glafira','senior'), ('2026-09-20','glafira','senior'),
  ('2026-09-21','yana','senior'),    ('2026-09-22','yana','senior'),
  ('2026-09-23','glafira','senior'), ('2026-09-24','glafira','senior'),
  ('2026-09-25','yana','senior'),    ('2026-09-26','yana','senior'),
  ('2026-09-27','glafira','senior'), ('2026-09-28','glafira','senior'),
  ('2026-09-29','yana','senior'),    ('2026-09-30','yana','senior')
on conflict do nothing;

-- Регламенты, которые уже описаны словами в базе знаний (ссылки на документы добавить в интерфейсе)
insert into public.regulations (code, title, description, departments, sort) values
  ('РЕГ-01', 'График смен службы поддержки',
   'Старший смены (Яна или Глафира) на смене каждый день без исключений. Первая линия (Лена, Саша, Аня) не работает более 2 дней подряд и не более 15 смен в месяц. Минимум 2 человека в офисе.',
   '{sales,activ}', 1),
  ('РЕГ-02', 'Маршрутизация обращений по линиям поддержки',
   'Линия 1 — продажи и типовые активации (категории А/Б/В, стандартная запись). Линия 2 (старший смены) — доплаты, возвраты, нетиповые записи, конфликт по сделке. Линия 3 (партнёр-менеджер) — партнёр как контрагент: сверки, договоры, ЛК партнёра. Сверх лимитов линии — руководитель отдела.',
   '{sales,activ,product}', 2)
on conflict do nothing;

-- Доступ первого администратора добавляется отдельным запросом, см. README (раздел «Вход»).

-- Режим без входа: публичный ключ (роль anon) читает и правит все таблицы управленки и реестр выплат.
-- Выполнять ПОСЛЕ 002_hr.sql. В config.js должно быть openAccess: true.
-- Обратный шаг (включить вход) — 005_close_access.sql.
do $$
declare t text;
begin
  foreach t in array array['departments','employees','regulations','processes','support_shifts','payroll_state'] loop
    execute format('drop policy if exists "open anon all" on public.%I', t);
    execute format('create policy "open anon all" on public.%I for all to anon using (true) with check (true)', t);
  end loop;
end $$;
drop policy if exists "open anon read history" on public.payroll_state_history;
create policy "open anon read history" on public.payroll_state_history for select to anon using (true);
grant select on public.payroll_schedule, public.payroll_month_status to anon;

-- Обновить кэш схемы API, чтобы таблицы стали видны сразу
notify pgrst, 'reload schema';

do $$
declare t text;
begin
  foreach t in array array['employees','departments','support_shifts','regulations','processes'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
