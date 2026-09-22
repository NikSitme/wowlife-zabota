-- Исправление: сохранение реестра выплат падало с ошибкой
-- "new row violates row-level security policy for table payroll_state_history" —
-- триггер истории не имел права писать в таблицу истории. Разрешаем запись в историю явно.
-- Выполнить один раз в SQL Editor. Повторный запуск безопасен.
drop policy if exists "history insert via trigger" on public.payroll_state_history;
create policy "history insert via trigger" on public.payroll_state_history
  for insert to anon, authenticated with check (true);

create or replace function public.payroll_state_keep_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.payroll_state_history (doc_id, version, state, saved_at)
  values (old.id, old.version, old.state, old.updated_at);
  return new;
end $$;
