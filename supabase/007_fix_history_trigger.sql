-- Исправление: триггер истории реестра выплат пишет в payroll_state_history от имени владельца функции,
-- а не от имени пользователя. Иначе в режиме без входа сохранение реестра падало с ошибкой
-- "new row violates row-level security policy for table payroll_state_history".
-- Выполнить один раз в SQL Editor.
create or replace function public.payroll_state_keep_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.payroll_state_history (doc_id, version, state, saved_at)
  values (old.id, old.version, old.state, old.updated_at);
  return new;
end $$;
