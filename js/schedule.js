// График работы: календарь смен службы поддержки + режим работы остальных.
import { HR, sb, esc, isAdmin, empById, activeEmployees, deptName, MONTHS_NOM, loadTable, reportError, setSync } from './db.js';

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const LIMIT_LINE_MONTH = 15, LIMIT_LINE_STREAK = 2;
let cur = (() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() }; })();

const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();

export function shiftsOn(day){ return HR.shifts.filter(s => s.day === day); }
export function monthHasShifts(y, m){ return monthShifts(y, m).length > 0; }
export function supportStaff(){
  return activeEmployees().filter(e => e.support_role).sort((a, b) => (a.support_role === 'senior' ? 0 : 1) - (b.support_role === 'senior' ? 0 : 1) || a.full_name.localeCompare(b.full_name));
}
function monthShifts(y = cur.y, m = cur.m){ const p = iso(y, m, 1).slice(0, 7); return HR.shifts.filter(s => s.day.startsWith(p)); }
function has(day, empId){ return HR.shifts.some(s => s.day === day && s.employee_id === empId); }

/* ---------- проверка правил ---------- */
export function checkRules(y = cur.y, m = cur.m){
  const staff = supportStaff(), n = daysIn(y, m), issues = [];
  const shifts = monthShifts(y, m);
  for (let d = 1; d <= n; d++){
    const day = iso(y, m, d);
    const onDay = shifts.filter(s => s.day === day);
    if (!onDay.some(s => s.kind === 'senior')) issues.push({ day, text: `${d}: нет старшего смены` });
    if (onDay.length < 2) issues.push({ day, text: `${d}: меньше двух человек на смене` });
  }
  staff.filter(e => e.support_role === 'line').forEach(e => {
    const days = shifts.filter(s => s.employee_id === e.id).map(s => Number(s.day.slice(8))).sort((a, b) => a - b);
    if (days.length > LIMIT_LINE_MONTH) issues.push({ emp: e.id, text: `${e.short_name || e.full_name}: ${days.length} смен, лимит ${LIMIT_LINE_MONTH}` });
    let streak = 1;
    for (let i = 1; i < days.length; i++){
      streak = days[i] === days[i - 1] + 1 ? streak + 1 : 1;
      if (streak === LIMIT_LINE_STREAK + 1) issues.push({ emp: e.id, text: `${e.short_name || e.full_name}: больше ${LIMIT_LINE_STREAK} дней подряд (${days[i - LIMIT_LINE_STREAK]}–${days[i]})` });
    }
  });
  return issues;
}

/* ---------- отрисовка ---------- */
export function gotoMonth(y, m){ cur = { y, m }; }
export function renderSchedule(){
  const staff = supportStaff();
  const n = daysIn(cur.y, cur.m);
  const today = new Date(); const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());
  document.getElementById('schedMonthLabel').textContent = `${MONTHS_NOM[cur.m]} ${cur.y}`;
  const shifts = monthShifts();
  const issues = checkRules();
  const admin = isAdmin();

  const head = `<tr><th class="emp-col">Сотрудник</th>${Array.from({ length: n }, (_, i) => {
    const d = i + 1, dow = (new Date(cur.y, cur.m, d).getDay() + 6) % 7;
    const day = iso(cur.y, cur.m, d);
    const bad = issues.some(x => x.day === day);
    return `<th class="day-col${dow >= 5 ? ' weekend' : ''}${day === todayIso ? ' today' : ''}${bad ? ' bad' : ''}" title="${bad ? esc(issues.filter(x => x.day === day).map(x => x.text).join('\n')) : ''}"><span class="dn">${d}</span><span class="dw">${WEEKDAYS[dow]}</span></th>`;
  }).join('')}<th class="sum-col">Смен</th></tr>`;

  const rows = staff.map(e => {
    const cnt = shifts.filter(s => s.employee_id === e.id).length;
    const over = e.support_role === 'line' && cnt > LIMIT_LINE_MONTH;
    const empBad = issues.some(x => x.emp === e.id);
    return `<tr class="${e.support_role}">
      <td class="emp-col"><button class="link-btn" data-emp="${e.id}">${esc(e.short_name || e.full_name)}</button><div class="muted small">${e.support_role === 'senior' ? 'старший смены' : 'первая линия'}</div></td>
      ${Array.from({ length: n }, (_, i) => {
        const d = i + 1, day = iso(cur.y, cur.m, d), dow = (new Date(cur.y, cur.m, d).getDay() + 6) % 7;
        const on = has(day, e.id);
        return `<td class="day-col${dow >= 5 ? ' weekend' : ''}${on ? ' on ' + e.support_role : ''}"${admin ? ` data-toggle="${day}|${e.id}|${e.support_role}" role="button"` : ''}>${on ? '●' : ''}</td>`;
      }).join('')}
      <td class="sum-col${over || empBad ? ' bad' : ''}">${cnt}${e.support_role === 'line' ? `<span class="muted">/${LIMIT_LINE_MONTH}</span>` : ''}</td>
    </tr>`;
  }).join('');

  document.getElementById('shiftGrid').innerHTML = staff.length
    ? `<table class="shift-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`
    : '<div class="empty-state">Нет сотрудников с ролью в поддержке. Укажите роль «первая линия» или «старший смены» в карточке сотрудника.</div>';

  document.getElementById('schedIssues').innerHTML = issues.length
    ? `<div class="issues"><b>Нарушения правил (${issues.length}):</b> ${issues.map(x => esc(x.text)).join(' · ')}</div>`
    : (staff.length ? '<div class="issues ok">Правила соблюдены: старший каждый день, минимум двое на смене, первая линия не больше 2 дней подряд и не больше 15 смен.</div>' : '');

  document.getElementById('schedActions').innerHTML = admin ? `
    <button class="mini-btn" id="genMonthBtn" title="Первая линия: по декадам один «соло» через день, остальные в паре. Старшие: ротация 2/2">Сгенерировать по правилу</button>
    <button class="mini-btn" id="clearMonthBtn">Очистить месяц</button>
    <span class="muted small">Клик по клетке ставит или снимает смену</span>` : '<span class="muted small">Редактировать график может администратор</span>';

  // режим работы остальных
  const others = activeEmployees().filter(e => !e.support_role);
  document.getElementById('workModes').innerHTML = others.length ? `<div class="table-scroll"><table class="data-table"><thead><tr><th>Сотрудник</th><th>Отдел</th><th>Режим работы</th></tr></thead><tbody>${
    others.map(e => `<tr data-emp="${e.id}" tabindex="0"><td>${esc(e.full_name)}<div class="muted small">${esc(e.title || '')}</div></td><td class="txt">${esc(deptName(e.department_id))}</td><td class="txt">${esc(e.work_mode || '—')}</td></tr>`).join('')
  }</tbody></table></div>` : '';
}

/* ---------- правки ---------- */
async function toggle(day, empId, kind){
  const on = has(day, empId);
  setSync('busy', 'Сохраняю…');
  try {
    if (on){ const { error } = await sb.from('support_shifts').delete().eq('day', day).eq('employee_id', empId); if (error) throw error; }
    else { const { error } = await sb.from('support_shifts').upsert({ day, employee_id: empId, kind }); if (error) throw error; }
    await loadTable('shifts'); renderSchedule(); setSync('ok', 'Сохранено');
  } catch(e){ reportError(e, 'График'); }
}

async function generateMonth(){
  const staff = supportStaff();
  const line = staff.filter(e => e.support_role === 'line'), senior = staff.filter(e => e.support_role === 'senior');
  if (!line.length || !senior.length){ alert('Нужны и старшие смены, и первая линия'); return; }
  if (monthShifts().length && !confirm('В этом месяце уже есть смены. Заменить их сгенерированными?')) return;
  const n = daysIn(cur.y, cur.m), rows = [];
  for (let d = 1; d <= n; d++){
    const day = iso(cur.y, cur.m, d);
    // старшие: 2/2 по кругу
    rows.push({ day, employee_id: senior[Math.floor((d - 1) / 2) % senior.length].id, kind: 'senior' });
    // первая линия: декады, один «соло» через день, остальные в паре
    if (line.length === 1){ rows.push({ day, employee_id: line[0].id, kind: 'line' }); continue; }
    const block = Math.floor((d - 1) / 10), pos = (d - 1) % 10;
    const solo = line[block % line.length];
    if (pos % 2 === 1) rows.push({ day, employee_id: solo.id, kind: 'line' });
    else line.filter(e => e.id !== solo.id).forEach(e => rows.push({ day, employee_id: e.id, kind: 'line' }));
  }
  setSync('busy', 'Сохраняю…');
  try {
    const p = iso(cur.y, cur.m, 1).slice(0, 7);
    const del = await sb.from('support_shifts').delete().gte('day', `${p}-01`).lte('day', `${p}-${n}`); if (del.error) throw del.error;
    const ins = await sb.from('support_shifts').insert(rows); if (ins.error) throw ins.error;
    await loadTable('shifts'); renderSchedule(); setSync('ok', 'Сохранено');
  } catch(e){ reportError(e, 'График'); }
}
async function clearMonth(){
  if (!confirm(`Удалить все смены за ${MONTHS_NOM[cur.m].toLowerCase()} ${cur.y}?`)) return;
  const n = daysIn(cur.y, cur.m), p = iso(cur.y, cur.m, 1).slice(0, 7);
  try {
    const { error } = await sb.from('support_shifts').delete().gte('day', `${p}-01`).lte('day', `${p}-${n}`); if (error) throw error;
    await loadTable('shifts'); renderSchedule();
  } catch(e){ reportError(e, 'График'); }
}

document.addEventListener('click', e => {
  if (e.target.closest('#schedPrev')){ cur.m--; if (cur.m < 0){ cur.m = 11; cur.y--; } renderSchedule(); return; }
  if (e.target.closest('#schedNext')){ cur.m++; if (cur.m > 11){ cur.m = 0; cur.y++; } renderSchedule(); return; }
  if (e.target.closest('#genMonthBtn')){ generateMonth(); return; }
  if (e.target.closest('#clearMonthBtn')){ clearMonth(); return; }
  const t = e.target.closest('[data-toggle]');
  if (t){ const [day, empId, kind] = t.dataset.toggle.split('|'); toggle(day, empId, kind); }
});
