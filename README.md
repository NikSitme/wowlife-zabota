# WOWlife управленка

Дашборд операционного директора wowlife: оргструктура, сотрудники с документами и должностными
инструкциями, график смен поддержки, регламенты, бизнес-процессы и реестр выплат команды заботы.

Хостинг: GitHub Pages (https://niksitme.github.io/wowlife-zabota/). Данные: Supabase (Postgres).
Вход по email и паролю (Supabase Auth). Правки кода вносятся через Claude Code и попадают на сайт
после push в `main` (кэш GitHub Pages до 10 минут).

## Структура

```
index.html        оболочка: вход, навигация, разделы
config.js         URL проекта Supabase и публичный ключ
css/app.css       базовые стили (из реестра выплат)
css/hr.css        стили разделов управленки
js/db.js          клиент Supabase, вход, роль, кэш справочников, realtime
js/ui.js          модальная форма, боковая карточка
js/people.js      оргструктура, список сотрудников, карточка, формы
js/schedule.js    график смен поддержки и режимы работы
js/docs.js        регламенты и процессы
js/payroll.js     реестр выплат (jsonb-документ payroll_state, только администратор)
js/app.js         точка входа
supabase/schema.sql      миграция 1: реестр выплат
supabase/002_hr.sql      миграция 2: таблицы управленки, роли, политики доступа
supabase/003_seed_hr.sql черновик данных: отделы, сотрудники, смены сентября, регламенты
supabase/rollback.sql    откат реестра выплат к прошлой версии
```

## Режим без входа (сейчас включён)

В `config.js` стоит `openAccess: true`: экрана входа нет, любой, у кого есть ссылка, видит и правит всё,
включая выплаты. Для этого в базе должен быть выполнен `supabase/004_open_access.sql`.
Чтобы включить вход: создать пользователей и заполнить `allowed_users` (см. ниже), выполнить
`supabase/005_close_access.sql`, поставить `openAccess: false` и запушить.

## Первичная настройка

1. **База.** В Supabase → SQL Editor выполнить по очереди `schema.sql`, `002_hr.sql`, `003_seed_hr.sql`,
   и для режима без входа `004_open_access.sql`.
2. **Ключи.** Project Settings → API Keys: Project URL и publishable key вписать в `config.js`.
   Секретный ключ (secret / service_role) в репозиторий не класть.
3. **Первый администратор.**
   - Authentication → Users → Add user → Create new user: email, пароль, включить Auto Confirm.
   - SQL Editor:
     ```sql
     insert into public.allowed_users (email, role, employee_id)
     values ('адрес-администратора', 'admin', 'nikita')
     on conflict (email) do update set role = excluded.role;
     ```
4. **GitHub Pages.** Settings → Pages → Deploy from a branch → `main` / root.

## Доступ

- Роли: `admin` правит всё и видит выплаты; `viewer` только смотрит (без выплат).
- Новый сотрудник: создать пользователя в Authentication → Users (с паролем, Auto Confirm),
  затем добавить строку в `allowed_users` с ролью и кодом сотрудника. Без строки в
  `allowed_users` вход не пройдёт.
- Смена пароля: Authentication → Users → пользователь → Reset password / Update password.
  Письма встроенная почта Supabase шлёт только участникам проекта, поэтому восстановление
  пароля самими сотрудниками заработает после подключения своего SMTP (Project Settings → Auth → SMTP).
- Документы (договоры ГПХ, инструкции) хранятся в Google Drive, в базе только ссылки.

## Как устроено хранение

- Справочники управленки — обычные таблицы: `departments`, `employees`, `regulations`, `processes`,
  `support_shifts`, `allowed_users`. Row Level Security: читать могут вошедшие из `allowed_users`,
  писать только `admin`. Realtime включён, правки видны всем сразу.
- Реестр выплат — одна jsonb-запись `payroll_state` с версией и историей `payroll_state_history`
  (откат: `rollback.sql`). Доступ только `admin`.
- Коды сотрудников (`employees.id`) совпадают с кодами в реестре выплат (`galya`, `lena`, ...).

## График смен

Правила поддержки: старший смены каждый день, минимум двое на смене, первая линия не больше
2 дней подряд и не больше 15 смен в месяц. Нарушения подсвечиваются. «Сгенерировать по правилу»:
первая линия по декадам (один «соло» через день, остальные в паре), старшие 2/2. В месяцах на
31 день правило даёт 16 смен двум людям, лишние смены снимаются вручную кликом.
