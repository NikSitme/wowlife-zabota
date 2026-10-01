// Сотрудник — одна сущность: запись в таблице employees (управленка). Реестр выплат берёт людей отсюда же,
// а увольнение в карточке убирает из графика выплаты за периоды после ухода.
import { sb, HR } from './db.js';

const RU_MONTHS = ['ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ','ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ'];

// Группа в реестре выплат = отдел в оргструктуре
export const DEPT_ROLE = { sales: '1 линия', activ: '2 линия', product: 'Продукт', mkt: 'Маркетинг', admin: 'Администраторы',
  mp: 'Маркетплейсы', dev: 'Разработка', mgmt: 'Руководство' };
export function payrollRole(e){
  if (/разов/i.test(e.title || '')) return 'Разовая';
  return DEPT_ROLE[e.department_id] || 'Без отдела';
}

// Номер месяца для сравнения периодов: год*12 + месяц
export const keyOfDate = iso => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1;
export const keyOfLabel = (label, years) => ((years && years[label]) || 2026) * 12 + RU_MONTHS.indexOf(label);
// Период выплаты — месяц расчёта (sourceCalcMonth), а для разовых строк — месяц самой выплаты
export const rowPeriodKey = (it, years) => it.sourceCalcMonth ? keyOfLabel(it.sourceCalcMonth, years) : keyOfDate(it.date);

export const hireKey = e => (e && e.hired_at) ? keyOfDate(e.hired_at) : -Infinity;
// Последний месяц, за который уволенному ещё положены выплаты: месяц даты ухода. Если дата ухода не указана —
// последний оплаченный период (то, что после него, считаем неположенным).
export function leaveCutoff(e, s){
  if (!e || e.status !== 'former') return Infinity;
  if (e.left_at) return keyOfDate(e.left_at);
  const paid = s.schedule.filter(it => it.emp === e.id && it.paid).map(it => rowPeriodKey(it, s.years));
  return paid.length ? Math.max(...paid) : -Infinity;
}

export const FINAL_NOTE = 'окончательный расчёт при увольнении — проверить сумму';
export const AFTER_LEAVE_NOTE = 'сотрудник уволен — проверить, положена ли выплата';
// Убирает из графика неоплаченные плановые выплаты (аванс/ЗП по расчёту месяца) уволенных за периоды после ухода;
// выплату за месяц ухода оставляет с пометкой «окончательный расчёт». Разовые выплаты, внесённые вручную,
// не удаляет (это может быть оплата за работу до ухода) — только помечает. Оплаченное не трогает.
// Повторный запуск ничего не меняет.
export function applyDepartures(s, employees){
  let changed = 0;
  const mark = (it, note) => { if (!(it.note || '').includes(note)){ it.note = it.note ? `${it.note}; ${note}` : note; changed++; } };
  employees.filter(e => e.status === 'former').forEach(e => {
    const cut = leaveCutoff(e, s);
    const before = s.schedule.length;
    s.schedule = s.schedule.filter(it => !(it.emp === e.id && !it.paid && it.sourceCalcMonth && rowPeriodKey(it, s.years) > cut));
    changed += before - s.schedule.length;
    s.schedule.forEach(it => {
      if (it.emp !== e.id || it.paid) return;
      const k = rowPeriodKey(it, s.years);
      if (it.sourceCalcMonth && k === cut) mark(it, FINAL_NOTE);
      else if (!it.sourceCalcMonth && k > cut) mark(it, AFTER_LEAVE_NOTE);
    });
  });
  return changed;
}

// Вызывается из карточки после увольнения: правит реестр выплат прямо в базе (с проверкой версии), чтобы
// уход отразился в выплатах, даже если вкладку «Выплаты» никто не открывал. Возвращает число изменённых строк.
export async function syncDeparturesToPayroll(){
  if (!sb) return 0;
  for (let attempt = 0; attempt < 3; attempt++){
    const { data, error } = await sb.from('payroll_state').select('state,version').eq('id', 'zabota').maybeSingle();
    if (error) throw error;
    if (!data) return 0;
    const s = data.state;
    const changed = applyDepartures(s, HR.employees);
    if (!changed) return 0;
    const upd = await sb.from('payroll_state').update({ state: s, version: data.version + 1, updated_at: new Date().toISOString() })
      .eq('id', 'zabota').eq('version', data.version).select('version');
    if (upd.error) throw upd.error;
    if (upd.data && upd.data.length) return changed;
    // кто-то сохранил реестр одновременно с нами — перечитываем и повторяем
  }
  throw new Error('реестр выплат занят, увольнение в выплатах не отразилось — откройте «Выплаты», там применится само');
}
