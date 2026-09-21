-- Дата окончания испытательного срока в карточке сотрудника. Выполнить один раз в SQL Editor.
alter table public.employees add column if not exists probation_end date;
notify pgrst, 'reload schema';
