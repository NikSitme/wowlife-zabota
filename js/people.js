// Оргструктура, список сотрудников, карточка сотрудника.
import { HR, esc, isAdmin, empById, deptById, empName, deptName, activeEmployees,
         fmtDate, tenure, STATUS_LABEL, CONTRACT_LABEL, upsert, remove, reportError, todayISO } from './db.js';
import { openForm, openDrawer, closeDrawer, linkOrDash, pill } from './ui.js';

let empFilters = { q: '', dept: 'all', status: 'active' };
let openedId = null, openedTab = 'profile';

/* ================= оргструктура ================= */
export const isVacancy = e => /вакансия/i.test(e.full_name || '');
export const isPlaceholder = e => !e.full_name || e.full_name === e.title || /уточнить/i.test(e.full_name) || isVacancy(e);
export function renderOrg(){
  const wrap = document.getElementById('orgChart');
  const emps = activeEmployees();
  const roots = emps.filter(e => !e.manager_id || !empById(e.manager_id) || empById(e.manager_id).status === 'former');
  const children = id => emps.filter(e => e.manager_id === id).sort((a, b) => (children0(b.id) - children0(a.id)) || (rank(a) - rank(b)) || ((deptById(a.department_id)?.sort ?? 99) - (deptById(b.department_id)?.sort ?? 99)) || (a.title || '').localeCompare(b.title || '', 'ru') || a.full_name.localeCompare(b.full_name, 'ru'));
  // старшие смены — наверх, позиции без имени ниже людей, открытые вакансии — в самый низ
  const rank = e => isVacancy(e) ? 3 : (isPlaceholder(e) ? 2 : (e.support_role === 'senior' ? 0 : 1));
  const children0 = id => emps.filter(e => e.manager_id === id).length;
  const countAll = id => { const k = emps.filter(e => e.manager_id === id); return k.length + k.reduce((n, x) => n + countAll(x.id), 0); };

  // Карточка: должность — главная строка, имя — вторая. Позиция без имени — пунктиром.
  const nodeHtml = (e, kind) => {
    const ph = isPlaceholder(e), total = countAll(e.id);
    return `<button class="org-node ${kind}${ph ? ' placeholder' : ''}" data-emp="${e.id}" style="--dept-color:${deptColor(e.department_id)}">
      <span class="org-title">${esc(e.title || 'Должность не указана')}</span>
      <span class="org-name">${isVacancy(e) ? 'вакансия открыта' : (ph ? 'имя не указано' : esc(e.full_name))}</span>
      ${total ? `<span class="org-count">${total} в подчинении</span>` : ''}
    </button>`;
  };
  // Ветка: если у всех подчинённых нет своих подчинённых — ставим их столбиком под руководителем
  // (так схема всегда помещается по ширине); иначе — в ряд, каждый со своей веткой.
  // Руководитель нескольких отделов (например, РОП: продажи и активации) — его люди делятся на ветки по отделам.
  const splitGroups = e => {
    const kids = children(e.id);
    if (!kids.length || !kids.every(k => !children0(k.id))) return null;
    const headed = HR.departments.filter(d => d.head_id === e.id).sort((a, b) => a.sort - b.sort);
    if (headed.length < 2) return null;
    const groups = headed.map(d => ({ id: d.id, name: d.name, kids: kids.filter(k => k.department_id === d.id) })).filter(g => g.kids.length);
    const rest = kids.filter(k => !headed.some(d => d.id === k.department_id));
    if (rest.length) groups.push({ id: null, name: 'Другие', kids: rest });
    return groups.length >= 2 ? groups : null;
  };
  const groupHtml = g => `<div class="org-node group" style="--dept-color:${deptColor(g.id)}"><span class="org-title">${esc(g.name)}</span><span class="org-name">${g.kids.length} чел.</span></div>`;
  const branch = (e, kind) => {
    const kids = children(e.id);
    if (!kids.length) return nodeHtml(e, kind);
    const groups = splitGroups(e);
    if (groups) return `${nodeHtml(e, kind)}<div class="org-row">${groups.map(g => `<div class="org-col sub">${groupHtml(g)}<div class="org-stack">${g.kids.map(k => nodeHtml(k, 'leaf')).join('')}</div></div>`).join('')}</div>`;
    const allLeaves = kids.every(k => !children0(k.id));
    if (allLeaves) return `${nodeHtml(e, kind)}<div class="org-stack">${kids.map(k => nodeHtml(k, 'leaf')).join('')}</div>`;
    return `${nodeHtml(e, kind)}<div class="org-row">${kids.map(k => `<div class="org-col${splitGroups(k) ? ' wide' : ''}">${branch(k, 'head')}</div>`).join('')}</div>`;
  };
  wrap.innerHTML = roots.length
    ? `<div class="org-scroll">${roots.map(r => `<div class="org">${branch(r, 'root')}</div>`).join('')}</div>`
    : '<div class="empty-state">Сотрудников пока нет</div>';

  // отделы
  const dl = document.getElementById('deptList');
  dl.innerHTML = HR.departments.slice().sort((a, b) => a.sort - b.sort).map(d => {
    const staff = emps.filter(e => e.department_id === d.id);
    return `<div class="dept-card" style="--dept-color:${deptColor(d.id)}">
      <div class="dept-head">
        <h3>${esc(d.name)}</h3>
        <span class="muted">${staff.length} чел.${d.head_id ? ` · руководитель ${esc(empName(d.head_id))}` : ''}</span>
        ${isAdmin() ? `<button class="icon-btn edit" data-edit-dept="${d.id}" title="Изменить отдел">✎</button>` : ''}
      </div>
      ${d.mission ? `<p class="dept-mission">${esc(d.mission)}</p>` : ''}
      <div class="chip-row">${staff.map(e => `<button class="chip small" data-emp="${e.id}">${esc(e.short_name || e.full_name)}</button>`).join('') || '<span class="muted">пусто</span>'}</div>
    </div>`;
  }).join('') + (isAdmin() ? `<button class="mini-btn" id="addDeptBtn">+ Добавить отдел</button>` : '');
}

const PALETTE = ['#2E5AAC','#B8842E','#2F6F5E','#8A6FA6','#B2555A','#5E8C4A','#7A5D8A','#9B6A3E','#4E6B8E','#5A7CA6'];
function deptColor(id){
  const idx = HR.departments.findIndex(d => d.id === id);
  return PALETTE[(idx < 0 ? 9 : idx) % PALETTE.length];
}

function deptForm(d){
  openForm({
    title: d ? 'Отдел' : 'Новый отдел',
    fields: [
      { key: 'id', label: 'Код (латиницей, без пробелов)', type: 'text', required: true, hint: d ? 'Код менять нельзя' : 'Например: marketing' },
      { key: 'name', label: 'Название', type: 'text', required: true },
      { key: 'mission', label: 'За что отвечает', type: 'textarea', rows: 2, width: 'full' },
      { key: 'head_id', label: 'Руководитель', type: 'select', options: activeEmployees().map(e => ({ value: e.id, label: e.full_name })) },
      { key: 'sort', label: 'Порядок', type: 'number' },
    ],
    values: d || { sort: 100 },
    onSave: async v => {
      if (d) v.id = d.id;
      if (!/^[a-z0-9_-]+$/i.test(v.id || '')) throw new Error('Код: только латиница, цифры, дефис');
      await upsert('departments', v);
      renderOrg(); renderEmployees();
    },
    onDelete: d ? async () => {
      if (HR.employees.some(e => e.department_id === d.id)) throw new Error('Сначала переведите сотрудников в другой отдел');
      await remove('departments', { id: d.id }); renderOrg(); renderEmployees();
    } : null,
  });
  if (d) document.getElementById('f_id').disabled = true;
}

/* ================= список сотрудников ================= */
export function renderEmployees(){
  const tb = document.getElementById('empToolbar');
  const depts = HR.departments.slice().sort((a, b) => a.sort - b.sort);
  tb.innerHTML = `
    <input type="search" id="empSearch" class="mini-input" placeholder="Поиск по имени или должности" value="${esc(empFilters.q)}">
    <div class="chip-group" id="empDeptChips">
      <button class="chip${empFilters.dept === 'all' ? ' active' : ''}" data-dept="all">Все отделы</button>
      ${depts.map(d => `<button class="chip${empFilters.dept === d.id ? ' active' : ''}" data-dept="${d.id}">${esc(d.name)}</button>`).join('')}
    </div>
    <div class="segmented" id="empStatusSeg">
      <button data-status="active"${empFilters.status === 'active' ? ' class="active"' : ''}>Работают</button>
      <button data-status="former"${empFilters.status === 'former' ? ' class="active"' : ''}>Не работают</button>
      <button data-status="all"${empFilters.status === 'all' ? ' class="active"' : ''}>Все</button>
    </div>
    ${isAdmin() ? `<button class="sync-btn" id="addEmpBtn">+ Добавить сотрудника</button>` : ''}`;

  const q = empFilters.q.toLowerCase();
  const rows = HR.employees.filter(e => {
    if (empFilters.status === 'active' && e.status === 'former') return false;
    if (empFilters.status === 'former' && e.status !== 'former') return false;
    if (empFilters.dept !== 'all' && e.department_id !== empFilters.dept) return false;
    if (q && !(`${e.full_name} ${e.short_name || ''} ${e.title || ''}`).toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => (deptById(a.department_id)?.sort ?? 99) - (deptById(b.department_id)?.sort ?? 99) || a.full_name.localeCompare(b.full_name));

  const stats = document.getElementById('empStats');
  const act = HR.employees.filter(e => e.status === 'active' && !isPlaceholder(e));
  const vacancies = HR.employees.filter(e => e.status === 'active' && isVacancy(e)).length;
  const withDate = act.filter(e => e.hired_at);
  const avgMonths = withDate.length ? Math.round(withDate.reduce((s, e) => s + monthsSince(e.hired_at), 0) / withDate.length) : null;
  const noDocs = act.filter(e => !e.gpx_link).length;
  stats.innerHTML = [
    ['В штате', act.length, vacancies ? `открытых вакансий: ${vacancies}` : `${HR.departments.length} отделов`],
    ['Средний стаж', avgMonths === null ? '—' : fmtMonths(avgMonths), withDate.length < act.length ? `дата выхода не указана у ${act.length - withDate.length}` : 'по всем'],
    ['Без должностной инструкции', act.filter(e => !e.job_desc_link && !e.job_purpose && !(e.duties || []).length).length, 'ни ссылки, ни текста'],
    ['Без ссылки на договор', noDocs, 'договор ГПХ не приложен'],
  ].map(([k, v, n]) => `<div class="stat-tile"><div class="stat-label">${k}</div><div class="stat-value">${v}</div><div class="stat-sub">${n}</div></div>`).join('');

  const list = document.getElementById('empList');
  if (!rows.length){ list.innerHTML = '<div class="empty-state">Никого не найдено</div>'; return; }
  list.innerHTML = `<div class="table-scroll"><table class="data-table emp-table">
    <thead><tr><th>Сотрудник</th><th>Отдел</th><th>Руководитель</th><th>В компании с</th><th>Стаж</th><th>Режим</th><th>Документы</th></tr></thead>
    <tbody>${rows.map(e => `<tr data-emp="${e.id}" tabindex="0">
      <td><div class="emp-name">${isVacancy(e) ? pill('вакансия', 'warn') : esc(e.full_name)}${e.status !== 'active' ? ' ' + pill(STATUS_LABEL[e.status], e.status === 'former' ? 'gray' : 'warn') : ''}</div><div class="muted small">${esc(e.title || '')}</div></td>
      <td class="txt"><span class="dept-dot" style="background:${deptColor(e.department_id)}"></span>${esc(deptName(e.department_id))}</td>
      <td class="txt">${esc(empName(e.manager_id))}</td>
      <td class="txt">${e.hired_at ? fmtDate(e.hired_at) : '<span class="muted">—</span>'}</td>
      <td class="txt">${e.hired_at ? tenure(e.hired_at, e.left_at) : '<span class="muted">—</span>'}</td>
      <td class="txt small">${esc(e.work_mode || '—')}</td>
      <td class="txt small">${docsIcons(e)}</td>
    </tr>`).join('')}</tbody></table></div>`;
}
function docsIcons(e){
  const items = [];
  if (e.gpx_link) items.push(`<a href="${esc(e.gpx_link)}" target="_blank" rel="noopener" title="Договор ГПХ">ГПХ ↗</a>`);
  if (e.job_desc_link) items.push(`<a href="${esc(e.job_desc_link)}" target="_blank" rel="noopener" title="Должностная инструкция">ДИ ↗</a>`);
  else if (e.job_purpose || (e.duties || []).length) items.push('<span title="Инструкция заполнена в карточке">ДИ ✓</span>');
  return items.join(' · ') || '<span class="muted">—</span>';
}
function monthsSince(iso){ const s = new Date(iso + 'T00:00:00'), t = new Date(); return Math.max(0, (t.getFullYear() - s.getFullYear()) * 12 + t.getMonth() - s.getMonth()); }
function fmtMonths(m){ const y = Math.floor(m / 12), mm = m % 12; return y ? `${y} г. ${mm} мес.` : `${mm} мес.`; }

/* ================= карточка ================= */
export function openEmployee(id, tab){
  openedId = id; if (tab) openedTab = tab;
  renderCard();
}
export function refreshCard(){ if (openedId && !document.getElementById('drawer').hidden) renderCard(); }

function renderCard(){
  const e = empById(openedId);
  if (!e){ closeDrawer(); return; }
  const d = deptById(e.department_id);
  const subs = HR.employees.filter(x => x.manager_id === e.id && x.status !== 'former');
  const tabs = [['profile', 'Профиль'], ['job', 'Инструкция'], ['regs', 'Регламенты'], ['procs', 'Процессы']];
  let body = '';
  if (openedTab === 'profile'){
    body = `
      <div class="p-sub">Работа в компании</div>
      <dl class="kv">
        <dt>Статус</dt><dd>${pill(STATUS_LABEL[e.status] || e.status, e.status === 'active' ? 'ok' : (e.status === 'former' ? 'gray' : 'warn'))}</dd>
        <dt>Отдел</dt><dd>${esc(d ? d.name : '—')}</dd>
        <dt>Руководитель</dt><dd>${e.manager_id ? `<button class="link-btn" data-emp="${e.manager_id}">${esc(empName(e.manager_id))}</button>` : '—'}</dd>
        <dt>В подчинении</dt><dd>${subs.length ? subs.map(s => `<button class="link-btn" data-emp="${s.id}">${esc(s.short_name || s.full_name)}</button>`).join(', ') : '—'}</dd>
        <dt>Дата выхода</dt><dd>${e.hired_at ? fmtDate(e.hired_at) : '<span class="muted">не указана</span>'}</dd>
        ${e.left_at ? `<dt>Дата ухода</dt><dd>${fmtDate(e.left_at)}</dd>` : ''}
        <dt>Стаж</dt><dd>${e.hired_at ? tenure(e.hired_at, e.left_at) : '—'}</dd>
        ${e.probation_end ? `<dt>Испытательный срок</dt><dd>до ${fmtDate(e.probation_end)}${e.probation_end < todayISO() ? ' · завершён' : ''}</dd>` : ''}
        <dt>Режим работы</dt><dd>${esc(e.work_mode || '—')}</dd>
        ${e.birthday ? `<dt>День рождения</dt><dd>${fmtDate(e.birthday).replace(/ \d{4}$/, '')}</dd>` : ''}
        ${e.support_role ? `<dt>В поддержке</dt><dd>${e.support_role === 'senior' ? 'старший смены' : 'первая линия'}</dd>` : ''}
      </dl>
      <div class="p-sub">Документы</div>
      <dl class="kv">
        <dt>Договор ГПХ</dt><dd>${linkOrDash(e.gpx_link, 'Открыть договор')}</dd>
        <dt>Должностная инструкция</dt><dd>${linkOrDash(e.job_desc_link, 'Открыть документ')}</dd>
      </dl>
      ${e.notes ? `<div class="p-sub">Заметки</div><p class="note-text">${esc(e.notes)}</p>` : ''}`;
  } else if (openedTab === 'job'){
    const has = e.job_purpose || (e.duties || []).length || (e.kpis || []).length;
    body = has ? `
      ${e.job_purpose ? `<div class="p-sub">Назначение должности</div><p class="note-text">${esc(e.job_purpose)}</p>` : ''}
      ${(e.duties || []).length ? `<div class="p-sub">Обязанности</div><ul class="li">${e.duties.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${(e.kpis || []).length ? `<div class="p-sub">Показатели</div><ul class="li">${e.kpis.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      ${e.job_desc_link ? `<div class="p-sub">Документ</div>${linkOrDash(e.job_desc_link, 'Полная инструкция')}` : ''}`
      : `<div class="empty-state">Инструкция не заполнена.${e.job_desc_link ? `<br>${linkOrDash(e.job_desc_link, 'Открыть документ')}` : ''}${isAdmin() ? '<br>Нажмите «Редактировать» и заполните назначение, обязанности и показатели.' : ''}</div>`;
  } else if (openedTab === 'regs'){
    const regs = HR.regulations.filter(r => !(r.departments || []).length || (r.departments || []).includes(e.department_id));
    body = regs.length ? regs.map(r => `<div class="reg-link">
        <div class="c">${esc(r.code || '')}${r.version ? ` · ред. ${esc(r.version)}` : ''}${r.updated_on ? ` · ${fmtDate(r.updated_on)}` : ''}</div>
        <div class="t2">${esc(r.title)}</div>
        ${r.description ? `<div class="muted small">${esc(r.description)}</div>` : ''}
        ${r.link ? `<div class="small">${linkOrDash(r.link, 'Документ')}</div>` : ''}
      </div>`).join('') : '<div class="empty-state">Регламентов для этого отдела нет</div>';
  } else {
    const procs = HR.processes.filter(p => p.owner_id === e.id || (p.participants || []).includes(e.id) || (!p.owner_id && !(p.participants || []).length && p.department_id === e.department_id));
    body = procs.length ? procs.map(p => `<div class="reg-link">
        <div class="c">${p.owner_id === e.id ? 'владелец' : 'участник'}${p.department_id ? ` · ${esc(deptName(p.department_id))}` : ''}</div>
        <div class="t2">${esc(p.title)}</div>
        ${p.goal ? `<div class="muted small">${esc(p.goal)}</div>` : ''}
        <div class="small"><button class="link-btn" data-proc="${p.id}">Открыть процесс</button></div>
      </div>`).join('') : '<div class="empty-state">Процессы с участием этого сотрудника не описаны</div>';
  }

  openDrawer(`
    <div class="p-hd" style="--dept-color:${deptColor(e.department_id)}">
      <button class="drawer-close icon-btn" title="Закрыть">×</button>
      <div class="nm">${esc(e.full_name)}</div>
      <div class="rl">${esc(e.title || '')}${d ? ` · ${esc(d.name)}` : ''}</div>
    </div>
    <div class="tabs-line">${tabs.map(([k, l]) => `<button class="tab-line${openedTab === k ? ' active' : ''}" data-ctab="${k}">${l}</button>`).join('')}</div>
    <div class="p-body">${body}</div>
    ${isAdmin() ? `<div class="p-foot"><button class="mini-btn" data-edit-emp="${e.id}">Редактировать</button>${e.status !== 'former' ? `<button class="link-btn danger-link" data-fire-emp="${e.id}">Уволить</button>` : ''}</div>` : ''}`);
}

/* ================= форма сотрудника ================= */
export function employeeForm(e){
  const depts = HR.departments.slice().sort((a, b) => a.sort - b.sort);
  openForm({
    title: e ? e.full_name : 'Новый сотрудник',
    fields: [
      { key: 'id', label: 'Код (латиницей)', type: 'text', required: true, hint: e ? 'Код менять нельзя' : 'Например: ivan. Совпадает с кодом в реестре выплат' },
      { key: 'full_name', label: 'Фамилия и имя', type: 'text', required: true },
      { key: 'short_name', label: 'Короткое имя', type: 'text' },
      { key: 'title', label: 'Должность', type: 'text' },
      { key: 'department_id', label: 'Отдел', type: 'select', options: depts.map(d => ({ value: d.id, label: d.name })) },
      { key: 'manager_id', label: 'Руководитель', type: 'select', options: activeEmployees().filter(x => !e || x.id !== e.id).map(x => ({ value: x.id, label: x.full_name })) },
      { key: 'status', label: 'Статус', type: 'select', allowEmpty: false, options: Object.entries(STATUS_LABEL).map(([v, l]) => ({ value: v, label: l })) },
      { key: 'hired_at', label: 'Дата выхода', type: 'date' },
      { key: 'left_at', label: 'Дата ухода', type: 'date' },
      ...(HR.employees.length && 'probation_end' in HR.employees[0] ? [{ key: 'probation_end', label: 'Испытательный срок до', type: 'date' }] : []),
      { key: 'work_mode', label: 'Режим работы', type: 'text', placeholder: '5/2, 10:00–19:00, офис' },
      { key: 'support_role', label: 'Роль в поддержке', type: 'select', options: [{ value: 'line', label: 'Первая линия' }, { value: 'senior', label: 'Старший смены' }] },
      { key: 'gpx_link', label: 'Ссылка на договор ГПХ (Google Drive)', type: 'url', width: 'full' },
      { key: 'job_desc_link', label: 'Ссылка на должностную инструкцию', type: 'url', width: 'full' },
      { key: 'job_purpose', label: 'Назначение должности', type: 'textarea', rows: 2, width: 'full' },
      { key: 'duties', label: 'Обязанности (по одной на строку)', type: 'lines', rows: 5, width: 'full' },
      { key: 'kpis', label: 'Показатели оценки (по одному на строку)', type: 'lines', rows: 3, width: 'full' },
      { key: 'birthday', label: 'День рождения', type: 'date' },
      { key: 'notes', label: 'Заметки', type: 'textarea', rows: 2, width: 'full' },
    ],
    values: e || { status: 'active' },
    onSave: async v => {
      if (e) v.id = e.id;
      if (!/^[a-z0-9_-]+$/i.test(v.id || '')) throw new Error('Код: только латиница, цифры, дефис');
      if (!e && empById(v.id)) throw new Error('Сотрудник с таким кодом уже есть');
      if (v.status === 'former' && !v.left_at) v.left_at = todayISO();
      if (v.status !== 'former') v.left_at = null;
      await upsert('employees', v);
      renderAll(); openEmployee(v.id);
    },
    onDelete: e ? async () => {
      if (HR.employees.some(x => x.manager_id === e.id)) throw new Error('У сотрудника есть подчинённые — сначала переназначьте их');
      await remove('employees', { id: e.id }); closeDrawer(); renderAll();
    } : null,
    deleteLabel: 'Удалить совсем',
    deleteConfirm: 'Удалить сотрудника из базы? Обычно достаточно отметить уход.',
  });
  if (e) document.getElementById('f_id').disabled = true;
}

async function fireEmployee(e){
  const date = prompt('Дата ухода (ГГГГ-ММ-ДД):', todayISO());
  if (!date) return;
  try { await upsert('employees', { id: e.id, status: 'former', left_at: date, support_role: null }); renderAll(); openEmployee(e.id); }
  catch(err){ reportError(err, 'Не удалось сохранить'); }
}

export function renderAll(){ renderOrg(); renderEmployees(); refreshCard(); }

/* ================= события ================= */
document.addEventListener('click', e => {
  const empBtn = e.target.closest('[data-emp]');
  if (empBtn){ openEmployee(empBtn.dataset.emp); return; }
  const ctab = e.target.closest('[data-ctab]');
  if (ctab){ openedTab = ctab.dataset.ctab; renderCard(); return; }
  const ed = e.target.closest('[data-edit-emp]');
  if (ed){ employeeForm(empById(ed.dataset.editEmp)); return; }
  const fire = e.target.closest('[data-fire-emp]');
  if (fire){ fireEmployee(empById(fire.dataset.fireEmp)); return; }
  if (e.target.closest('#addEmpBtn')){ employeeForm(null); return; }
  if (e.target.closest('#addDeptBtn')){ deptForm(null); return; }
  const edd = e.target.closest('[data-edit-dept]');
  if (edd){ deptForm(deptById(edd.dataset.editDept)); return; }
  const chip = e.target.closest('#empDeptChips .chip');
  if (chip){ empFilters.dept = chip.dataset.dept; renderEmployees(); return; }
  const seg = e.target.closest('#empStatusSeg button');
  if (seg){ empFilters.status = seg.dataset.status; renderEmployees(); return; }
});
document.addEventListener('input', e => {
  if (e.target.id === 'empSearch'){ empFilters.q = e.target.value.trim(); renderEmployees(); document.getElementById('empSearch').focus(); const el = document.getElementById('empSearch'); el.setSelectionRange(el.value.length, el.value.length); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('tr[data-emp]')) openEmployee(e.target.dataset.emp);
});
