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
