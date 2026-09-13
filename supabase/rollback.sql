-- Откат к предыдущей версии реестра. Выполнять в SQL Editor.
-- 1. Посмотреть историю (последние 20 сохранений):
select id, version, saved_at from public.payroll_state_history
where doc_id = 'zabota' order by version desc limit 20;

-- 2. Восстановить нужную версию (подставить её id из шага 1 вместо 123):
-- update public.payroll_state
-- set state = h.state, version = payroll_state.version + 1, updated_at = now()
-- from public.payroll_state_history h
-- where payroll_state.id = 'zabota' and h.id = 123;
