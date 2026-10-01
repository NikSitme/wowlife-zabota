// График отпусков: годовая лента по отделам, остаток дней, пересечения внутри отдела.
import { HR, esc, isAdmin, empById, deptById, empName, fmtDate, todayISO, MONTHS_NOM, MONTHS_GEN, upsert, remove, reportError } from './db.js';
import { openForm } from './ui.js';
import { isPlaceholder } from './people.js';

export const YEAR_NORM = 28; // ежегодный оплачиваемый отпуск по ТК РФ, календарных дней
const DAY = 86400000;
const D = iso => new Date(iso + 'T00:00:00');
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / DAY) + 1;
const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : (a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many); };
const dm = s => { const d = D(s); return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`; };
const range = v => v.start_date === v.end_date ? dm(v.start_date) : `${dm(v.start_date)} — ${dm(v.end_date)}`;

let year = new Date().getFullYear();

// Дни отпуска в пределах года (переходящий через Новый год делится по годам)
function daysInYear(v, y){
  const a = v.start_date > `${y}-01-01` ? v.start_date : `${y}-01-01`;
  const b = v.end_date < `${y}-12-31` ? v.end_date : `${y}-12-31`;
  return a > b ? 0 : daysBetween(a, b);
}
// Отпуск по ТК — только у тех, кто не ИП и не самозанятый
const hasPaidLeave = e => !['ИП', 'СЗ'].includes(e.contract_type);
export function vacationStats(e, y = year){
  const list = HR.vacations.filter(v => v.employee_id === e.id && v.kind === 'отпуск');
  const used = list.reduce((s, v) => s + daysInYear(v, y), 0);
  const limit = YEAR_NORM + (e.vacation_carryover || 0);
  return { used, limit, left: limit - used, paid: hasPaidLeave(e) };
}
export const vacationsOf = id => HR.vacations.filter(v => v.employee_id === id).sort((a, b) => a.start_date.localeCompare(b.start_date));
export const onVacation = (id, day) => HR.vacations.some(v => v.employee_id === id && v.start_date <= day && v.end_date >= day);
// Условные даты (известно только число дней) в «сейчас» и «скоро» не попадают — они видны на ленте штриховкой
export const awayToday = () => HR.vacations.filter(v => { const t = todayISO(); return !v.approx && v.start_date <= t && v.end_date >= t; });

// Пересечения: двое из одного отдела отдыхают в одни дни (1 и 2 линия поддержки считаются вместе)
const crewOf = e => ['sales', 'activ'].includes(e.department_id) ? 'support' : e.department_id;
export function overlaps(y = year){
  const vs = HR.vacations.filter(v => daysInYear(v, y) > 0 && !v.approx); // у условных дат пересечение ничего не значит
  const out = [];
  for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++){
    const a = vs[i], b = vs[j];
    if (a.employee_id === b.employee_id) continue;
    const ea = empById(a.employee_id), eb = empById(b.employee_id);
    if (!ea || !eb || crewOf(ea) !== crewOf(eb)) continue;
    const s = a.start_date > b.start_date ? a.start_date : b.start_date, f = a.end_date < b.end_date ? a.end_date : b.end_date;
    if (s <= f) out.push({ a, b, start: s, end: f, days: daysBetween(s, f), crew: crewOf(ea) });
  }
  return out.sort((x, y2) => x.start.localeCompare(y2.start));
}

/* ================= страница ================= */
export function renderVacations(){
  const wrap = document.getElementById('vacPage');
  if (!wrap) return;
  if (HR.missing.vacations){
    wrap.innerHTML = `<div class="empty-state">Таблица отпусков ещё не создана в базе. Выполните <b>supabase/008_vacations.sql</b> в Supabase → SQL Editor и обновите страницу.</div>`;
    return;
  }
  const people = HR.employees.filter(e => e.status !== 'former' && !isPlaceholder(e));
  const depts = HR.departments.slice().sort((a, b) => a.sort - b.sort);
  const y0 = D(`${year}-01-01`), total = (D(`${year + 1}-01-01`) - y0) / DAY;
  const pos = s => Math.max(0, (D(s) - y0) / DAY) / total * 100;
  const today = todayISO();
  const todayPct = today.startsWith(String(year)) ? pos(today) + 0.5 / total * 100 : null;

  // сводка
  const now = awayToday();
  const soon = HR.vacations.filter(v => !v.approx && v.start_date > today && (D(v.start_date) - D(today)) / DAY <= 30).sort((a, b) => a.start_date.localeCompare(b.start_date));
  const ov = overlaps().filter(o => o.end >= today);
  const tile = (label, value, items) => `<article class="vac-tile"><span class="vac-tile-label">${label}</span><span class="vac-tile-value">${value}</span>${items ? `<div class="vac-tile-list">${items}</div>` : ''}</article>`;
  const who = v => `<button class="link-btn" data-emp="${v.employee_id}">${esc(empName(v.employee_id))}</button> <span class="muted">${range(v)}</span>`;
  const summary = `<div class="vac-summary">
    ${tile('Сейчас в отпуске', now.length, now.map(who).join('<br>') || '<span class="muted">никого</span>')}
    ${tile('Уходят в ближайшие 30 дней', soon.length, soon.slice(0, 5).map(who).join('<br>') || '<span class="muted">никто</span>')}
    ${tile('Пересечения в отделе', ov.length, ov.slice(0, 4).map(o => `${esc(empName(o.a.employee_id))} и ${esc(empName(o.b.employee_id))} <span class="muted">${o.start === o.end ? dm(o.start) : `${dm(o.start)} — ${dm(o.end)}`}</span>`).join('<br>') || '<span class="muted">нет</span>')}
  </div>`;

  // шкала месяцев
  const months = MONTHS_NOM.map((m, i) => { const a = pos(`${year}-${String(i + 1).padStart(2, '0')}-01`); const b = i === 11 ? 100 : pos(`${year}-${String(i + 2).padStart(2, '0')}-01`); return { m, a, w: b - a }; });
  const scale = `<div class="vac-row vac-scale"><div class="vac-who"></div><div class="vac-track">${months.map(x => `<span class="vac-month" style="left:${x.a}%;width:${x.w}%">${x.m.slice(0, 3)}</span>`).join('')}</div><div class="vac-count"></div></div>`;
  const grid = `<div class="vac-grid">${months.map(x => `<span style="left:${x.a}%"></span>`).join('')}${todayPct !== null ? `<i class="vac-today" style="left:${todayPct}%"></i>` : ''}</div>`;

  const rowHtml = e => {
    const st = vacationStats(e);
    const bars = vacationsOf(e.id).filter(v => daysInYear(v, year) > 0).map(v => {
      const a = pos(v.start_date < `${year}-01-01` ? `${year}-01-01` : v.start_date);
      const endNext = iso(new Date(D(v.end_date > `${year}-12-31` ? `${year}-12-31` : v.end_date).getTime() + DAY));
      const b = v.end_date >= `${year}-12-31` ? 100 : pos(endNext);
      const cls = ['vac-bar', v.status === 'план' ? 'plan' : 'ok', v.approx ? 'approx' : '', v.kind !== 'отпуск' ? 'other' : ''].join(' ');
      return `<button class="${cls}" style="left:${a}%;width:${Math.max(b - a, 0.35)}%" data-vac="${v.id}" title="${esc(`${empName(e.id)}: ${v.kind}, ${range(v)} (${daysBetween(v.start_date, v.end_date)} дн.) · ${v.status}${v.approx ? ' · даты условные' : ''}${v.note ? ' · ' + v.note : ''}`)}"></button>`;
    }).join('');
    const count = st.paid
      ? `<span class="${st.left < 0 ? 'over' : ''}"><b>${st.used}</b> из ${st.limit}</span>`
      : `<span class="muted">${st.used ? `<b>${st.used}</b> дн.` : '—'}</span>`;
    return `<div class="vac-row"><div class="vac-who"><button class="link-btn" data-emp="${e.id}">${esc(e.short_name || e.full_name)}</button><span class="muted">${esc(e.title || '')}</span></div><div class="vac-track">${grid}${bars}</div><div class="vac-count">${count}</div></div>`;
  };
  const groups = depts.map(d => {
    const list = people.filter(e => e.department_id === d.id).sort((a, b) => (a.short_name || a.full_name).localeCompare(b.short_name || b.full_name, 'ru'));
    if (!list.length) return '';
    return `<div class="vac-dept"><h3>${esc(d.name)}</h3>${list.map(rowHtml).join('')}</div>`;
  }).join('');

  wrap.innerHTML = `
    <div class="toolbar">
      <div class="filter-block">
        <button class="mini-btn" data-vac-year="-1" title="Предыдущий год">‹</button>
        <span class="sched-month">${year}</span>
        <button class="mini-btn" data-vac-year="1" title="Следующий год">›</button>
      </div>
      <div class="vac-legend"><span class="vac-bar ok"></span>согласован <span class="vac-bar plan"></span>план <span class="vac-bar ok approx"></span>даты условные <span class="vac-bar ok other"></span>больничный, за свой счёт</div>
      ${isAdmin() ? `<button class="sync-btn" data-vac-add>+ Отпуск</button>` : ''}
    </div>
    <p class="help-note">Справа — дни ежегодного отпуска за ${year} год из нормы ${YEAR_NORM} + остаток прошлого года. У ИП и самозанятых отпуска по ТК нет, показано просто число дней. Пересечения считаются внутри отдела, 1 и 2 линия поддержки — вместе.</p>
    ${summary}
    <div class="vac-board">${scale}${groups}</div>`;
}

function vacForm(v, empId){
  const people = HR.employees.filter(e => e.status !== 'former' && !isPlaceholder(e)).sort((a, b) => a.full_name.localeCompare(b.full_name, 'ru'));
  openForm({
    title: v ? `Отпуск: ${empName(v.employee_id)}` : 'Новый отпуск',
    fields: [
      { key: 'employee_id', label: 'Сотрудник', type: 'select', allowEmpty: false, options: people.map(e => ({ value: e.id, label: e.full_name })) },
      { key: 'kind', label: 'Тип', type: 'select', allowEmpty: false, options: ['отпуск', 'за свой счёт', 'больничный', 'учёба'].map(k => ({ value: k, label: k })) },
      { key: 'start_date', label: 'С', type: 'date', required: true },
      { key: 'end_date', label: 'По (включительно)', type: 'date', required: true },
      { key: 'status', label: 'Статус', type: 'select', allowEmpty: false, options: [{ value: 'план', label: 'план' }, { value: 'согласован', label: 'согласован' }] },
      { key: 'approx', label: 'Даты', type: 'checkbox', checkLabel: 'условные (известно только число дней)' },
      { key: 'note', label: 'Комментарий', type: 'textarea', rows: 2, width: 'full' },
    ],
    values: v || { employee_id: empId || (people[0] && people[0].id), kind: 'отпуск', status: 'план' },
    onSave: async val => {
      if (!val.start_date || !val.end_date) throw new Error('Укажите даты');
      if (val.end_date < val.start_date) throw new Error('Дата окончания раньше начала');
      if (v) val.id = v.id;
      await upsert('vacations', val);
      renderVacations();
    },
    onDelete: v ? async () => { await remove('vacations', { id: v.id }); renderVacations(); } : null,
    deleteConfirm: 'Удалить этот отпуск?',
  });
}
export const openVacationForm = vacForm;

document.addEventListener('click', e => {
  const yb = e.target.closest('[data-vac-year]');
  if (yb){ year += Number(yb.dataset.vacYear); renderVacations(); return; }
  if (e.target.closest('[data-vac-add]')){ vacForm(null); return; }
  const add = e.target.closest('[data-vac-add-for]');
  if (add){ vacForm(null, add.dataset.vacAddFor); return; }
  const bar = e.target.closest('[data-vac]');
  if (bar){
    const v = HR.vacations.find(x => x.id === bar.dataset.vac);
    if (v && isAdmin()) vacForm(v); else if (v) reportError(new Error('только просмотр'), 'Отпуск');
  }
});
