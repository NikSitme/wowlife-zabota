-- Включить вход: убрать доступ публичного ключа, остаются политики для вошедших из allowed_users (002_hr.sql).
-- В config.js поставить openAccess: false. Перед этим создать пользователей и заполнить allowed_users (см. README).
do $$
declare t text;
begin
  foreach t in array array['departments','employees','regulations','processes','support_shifts','payroll_state'] loop
    execute format('drop policy if exists "open anon all" on public.%I', t);
  end loop;
end $$;
drop policy if exists "open anon read history" on public.payroll_state_history;
revoke select on public.payroll_schedule, public.payroll_month_status from anon;
