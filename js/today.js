// «Сегодня»: сигналы, которые требуют внимания операционного директора. Только чтение, всё из уже имеющихся данных.
import { HR, sb, esc, isAdmin, empById, empName, deptName, activeEmployees, fmtDate, todayISO, MONTHS_GEN, MONTHS_NOM } from './db.js';
import { isPlaceholder, isVacancy } from './people.js';
import { checkRules, shiftsOn, monthHasShifts, supportStaff, gotoMonth } from './schedule.js';

const DAY = 86400000;
const parse = iso => new Date(iso + 'T00:00:00');
const money = v => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(v) + ' ₽';
const dm = iso => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS_GEN[m - 1]}`; };
const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : (a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many); };

let payrollSchedule = null, payrollLoadedAt = 0;
async function loadPayrollSchedule(){
  if (!isAdmin() || !sb) return null;
  if (payrollSchedule && Date.now() - payrollLoadedAt < 30000) return payrollSchedule;
  const { data, error } = await sb.from('payroll_state').select('state').eq('id', 'zabota').maybeSingle();
  if (error || !data || !data.state) return null;
  payrollSchedule = data.state.schedule || []; payrollLoadedAt = Date.now();
  return payrollSchedule;
}

function card({ tone, title, value, sub, items, goto, gotoLabel, empty }){
  return `<article class="signal ${tone || ''}">
    <header><h3>${esc(title)}</h3>${value !== undefined ? `<span class="signal-value">${value}</span>` : ''}</header>
    ${sub ? `<p class="signal-sub">${sub}</p>` : ''}
    ${items && items.length ? `<ul class="signal-list">${items.join('')}</ul>` : (empty ? `<p class="signal-empty">${esc(empty)}</p>` : '')}
    ${goto ? `<button class="link-btn signal-goto" data-goto="${goto}">${esc(gotoLabel || 'Открыть')} →</button>` : ''}
  </article>`;
}
const empLink = (id, extra) => `<li><button class="link-btn" data-emp="${id}">${esc(empName(id))}</button>${extra ? ` <span class="muted">${extra}</span>` : ''}</li>`;

export async function renderToday(){
  const now = new Date(), today = todayISO(), t0 = parse(today);
  document.getElementById('todayTitle').textContent = `${now.getDate()} ${MONTHS_GEN[now.getMonth()]}, ${['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'][now.getDay()]}`;
  const wrap = document.getElementById('todaySignals');
  const cards = [];

  /* ---- 1. выплаты ---- */
  const sched = await loadPayrollSchedule();
  if (sched){
    const unpaid = sched.filter(x => !x.paid && (x.amount || 0) > 0); // нулевые строки — заготовки без суммы, платить нечего
    const overdue = unpaid.filter(x => parse(x.date) < t0).sort((a, b) => a.date.localeCompare(b.date));
    const week = unpaid.filter(x => { const d = parse(x.date); return d >= t0 && d - t0 <= 7 * DAY; }).sort((a, b) => a.date.localeCompare(b.date));
    const sum = list => list.reduce((s, x) => s + (x.amount || 0), 0);
    const row = x => `<li><span class="mono">${dm(x.date)}</span> ${esc(empName(x.emp))} <span class="muted">${esc(x.type)}</span> <b class="mono">${money(x.amount)}</b></li>`;
    cards.push(card({
      tone: overdue.length ? 'bad' : 'ok', title: 'Просроченные выплаты', value: overdue.length ? money(sum(overdue)) : '0',
      sub: overdue.length ? `${overdue.length} ${plural(overdue.length, 'выплата', 'выплаты', 'выплат')} не отмечены как выплаченные` : '',
      items: overdue.slice(0, 8).map(row), empty: 'Просрочки нет', goto: 'payroll', gotoLabel: 'Реестр выплат',
    }));
    cards.push(card({
      tone: week.length ? 'warn' : 'ok', title: 'Выплаты на 7 дней', value: week.length ? money(sum(week)) : '0',
      sub: week.length ? `${week.length} ${plural(week.length, 'выплата', 'выплаты', 'выплат')}, ближайшая ${dm(week[0].date)}` : '',
      items: week.slice(0, 8).map(row), empty: 'На ближайшую неделю выплат нет', goto: 'payroll', gotoLabel: 'Реестр выплат',
    }));
  }

  /* ---- 2. смены ---- */
  const staff = supportStaff();
  if (staff.length){
    const on = shiftsOn(today);
    const seniors = on.filter(s => s.kind === 'senior'), line = on.filter(s => s.kind === 'line');
    const issuesNow = checkRules(now.getFullYear(), now.getMonth());
    const futureIssues = issuesNow.filter(x => !x.day || x.day >= today);
    cards.push(card({
      tone: !seniors.length || on.length < 2 ? 'bad' : 'ok', title: 'Сегодня на смене', value: on.length,
      sub: on.length ? '' : 'На сегодня смены не проставлены',
      items: [...seniors.map(s => empLink(s.employee_id, 'старший смены')), ...line.map(s => empLink(s.employee_id, 'первая линия'))],
      goto: 'schedule', gotoLabel: 'График',
    }));
    const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextEmpty = !monthHasShifts(nm.getFullYear(), nm.getMonth());
    const items = futureIssues.slice(0, 6).map(x => `<li>${esc(x.text)}</li>`);
    if (nextEmpty && now.getDate() >= 15) items.unshift(`<li><b>${MONTHS_NOM[nm.getMonth()]} не расписан.</b> <span class="muted">Сгенерируйте месяц по правилу и поправьте вручную.</span></li>`);
    cards.push(card({
      tone: items.length ? 'warn' : 'ok', title: 'График поддержки', value: items.length || '✓',
      sub: items.length ? 'Нарушения правил до конца месяца' : '', items, empty: 'Правила соблюдены, следующий месяц под контролем',
      goto: 'schedule', gotoLabel: 'График',
    }));
  }

  /* ---- 3. пробелы в данных о людях ---- */
  const act = HR.employees.filter(e => e.status === 'active' && !isPlaceholder(e)); // вакансии и позиции без имени не считаем
  const gaps = [
    ['нет даты выхода', e => !e.hired_at],
    ['не указано оформление', e => !e.contract_type],
    ['ГПХ без ссылки на договор', e => e.contract_type === 'ГПХ' && !e.gpx_link],
    ['нет должностной инструкции', e => !e.job_desc_link && !e.job_purpose && !(e.duties || []).length],
    ['не указан режим работы', e => !e.support_role && !e.work_mode],
  ];
  const gapItems = [], gapPeople = new Set();
  gaps.forEach(([label, fn]) => { const list = act.filter(fn); if (list.length){ list.forEach(e => gapPeople.add(e.id)); gapItems.push(`<li><b>${list.length}</b> — ${label}: ${list.slice(0, 6).map(e => `<button class="link-btn" data-emp="${e.id}">${esc(e.short_name || e.full_name)}</button>`).join(', ')}${list.length > 6 ? ' …' : ''}</li>`); } });
  const filled = act.length ? Math.round((1 - gapPeople.size / act.length) * 100) : 100;
  cards.push(card({
    tone: gapPeople.size ? 'warn' : 'ok', title: 'Карточки сотрудников', value: `${filled}%`,
    sub: gapPeople.size ? `заполнены полностью; пробелы у ${gapPeople.size} из ${act.length}` : 'Все карточки заполнены',
    items: gapItems, goto: 'people', gotoLabel: 'Сотрудники',
  }));

  /* ---- 4. ближайшие даты ---- */
  const events = [];
  const nextOccurrence = (iso) => { const d = parse(iso); let n = new Date(t0.getFullYear(), d.getMonth(), d.getDate()); if (n < t0) n = new Date(t0.getFullYear() + 1, d.getMonth(), d.getDate()); return n; };
  act.forEach(e => {
    if (e.birthday){ const n = nextOccurrence(e.birthday); const diff = Math.round((n - t0) / DAY); if (diff <= 14) events.push({ diff, html: empLink(e.id, `день рождения ${diff === 0 ? 'сегодня' : `${n.getDate()} ${MONTHS_GEN[n.getMonth()]}`}`) }); }
    if (e.hired_at){
      const h = parse(e.hired_at);
      const probEnd = e.probation_end ? parse(e.probation_end) : new Date(h.getFullYear(), h.getMonth() + 3, h.getDate()); const pd = Math.round((probEnd - t0) / DAY);
      if (pd >= 0 && pd <= 30) events.push({ diff: pd, html: empLink(e.id, `конец испытательного срока ${probEnd.getDate()} ${MONTHS_GEN[probEnd.getMonth()]}`) });
      const n = nextOccurrence(e.hired_at); const diff = Math.round((n - t0) / DAY); const years = n.getFullYear() - h.getFullYear();
      if (diff <= 30 && years >= 1) events.push({ diff, html: empLink(e.id, `${years} ${plural(years, 'год', 'года', 'лет')} в компании ${n.getDate()} ${MONTHS_GEN[n.getMonth()]}`) });
    }
  });
  events.sort((a, b) => a.diff - b.diff);
  cards.push(card({
    tone: '', title: 'Ближайшие даты', value: events.length,
    items: events.slice(0, 8).map(x => x.html), empty: 'В ближайшие недели событий нет. Даты считаются по дню рождения и дате выхода в карточках.',
  }));

  /* ---- 5. регламенты и процессы ---- */
  const depts = HR.departments.slice().sort((a, b) => a.sort - b.sort).filter(d => act.some(e => e.department_id === d.id));
  const noProc = depts.filter(d => !HR.processes.some(p => p.department_id === d.id));
  const regsNoLink = HR.regulations.filter(r => !r.link);
  const pItems = [];
  if (noProc.length) pItems.push(`<li><b>${noProc.length}</b> ${plural(noProc.length, 'отдел', 'отдела', 'отделов')} без описанных процессов: ${noProc.map(d => esc(d.name)).join(', ')}</li>`);
  if (regsNoLink.length) pItems.push(`<li><b>${regsNoLink.length}</b> ${plural(regsNoLink.length, 'регламент', 'регламента', 'регламентов')} без ссылки на документ: ${regsNoLink.map(r => esc(r.code || r.title)).join(', ')}</li>`);
  cards.push(card({
    tone: pItems.length ? 'warn' : 'ok', title: 'Процессы и регламенты', value: `${HR.processes.length} / ${HR.regulations.length}`,
    sub: 'процессов описано / регламентов в реестре', items: pItems, empty: 'У каждого отдела есть процессы, у регламентов есть документы',
    goto: 'procs', gotoLabel: 'Процессы',
  }));

  const attention = cards.filter(c => /class="signal (bad|warn)"/.test(c)).length;
  document.getElementById('todaySub').textContent = attention ? `${attention} ${plural(attention, 'блок требует', 'блока требуют', 'блоков требуют')} внимания` : 'Всё под контролем';
  wrap.innerHTML = cards.join('');
}
