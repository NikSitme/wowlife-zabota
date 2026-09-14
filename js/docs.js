// Регламенты и бизнес-процессы.
import { HR, esc, isAdmin, empName, deptName, activeEmployees, fmtDate, upsert, remove } from './db.js';
import { openForm, linkOrDash, pill, openDrawer } from './ui.js';

const deptOpts = () => HR.departments.slice().sort((a, b) => a.sort - b.sort).map(d => ({ value: d.id, label: d.name }));
const empOpts = () => activeEmployees().map(e => ({ value: e.id, label: e.full_name }));

/* ================= регламенты ================= */
export function renderRegs(){
  const wrap = document.getElementById('regList');
  const regs = HR.regulations.slice().sort((a, b) => a.sort - b.sort || (a.code || '').localeCompare(b.code || ''));
  document.getElementById('regActions').innerHTML = isAdmin() ? `<button class="sync-btn" id="addRegBtn">+ Добавить регламент</button>` : '';
  wrap.innerHTML = regs.length ? `<div class="regs">${regs.map(r => `<div class="reg${isAdmin() ? ' editable' : ''}" ${isAdmin() ? `data-edit-reg="${r.id}"` : ''}>
      <div class="code">${esc(r.code || '')}${r.version ? ` · ред. ${esc(r.version)}` : ''}</div>
      <div class="t">${esc(r.title)}</div>
      ${r.description ? `<div class="d">${esc(r.description)}</div>` : ''}
      <div class="f">
        ${r.updated_on ? `<span>от ${fmtDate(r.updated_on)}</span>` : ''}
        <span>${(r.departments || []).length ? r.departments.map(deptName).map(esc).join(', ') : 'все отделы'}</span>
        ${r.owner_dept_id ? `<span>владелец: ${esc(deptName(r.owner_dept_id))}</span>` : ''}
      </div>
      <div class="f">${linkOrDash(r.link, 'Открыть документ')}</div>
    </div>`).join('')}</div>` : '<div class="empty-state">Регламентов пока нет</div>';
}

function regForm(r){
  openForm({
    title: r ? r.title : 'Новый регламент',
    fields: [
      { key: 'code', label: 'Код', type: 'text', placeholder: 'РЕГ-03' },
      { key: 'version', label: 'Редакция', type: 'text', placeholder: '1.0' },
      { key: 'title', label: 'Название', type: 'text', required: true, width: 'full' },
      { key: 'description', label: 'Кратко о чём', type: 'textarea', rows: 3, width: 'full' },
      { key: 'link', label: 'Ссылка на документ (Google Drive / Notion)', type: 'url', width: 'full' },
      { key: 'updated_on', label: 'Дата редакции', type: 'date' },
      { key: 'owner_dept_id', label: 'Отдел-владелец', type: 'select', options: deptOpts() },
      { key: 'departments', label: 'Кого касается (пусто = всех)', type: 'multiselect', options: deptOpts(), width: 'full' },
      { key: 'sort', label: 'Порядок', type: 'number' },
    ],
    values: r || { sort: 100 },
    onSave: async v => { if (r) v.id = r.id; if (v.sort == null) v.sort = 100; await upsert('regulations', v); renderRegs(); },
    onDelete: r ? async () => { await remove('regulations', { id: r.id }); renderRegs(); } : null,
  });
}

/* ================= процессы ================= */
export function renderProcs(){
  const wrap = document.getElementById('procList');
  const procs = HR.processes.slice().sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title));
  document.getElementById('procActions').innerHTML = isAdmin() ? `<button class="sync-btn" id="addProcBtn">+ Описать процесс</button>` : '';
  if (!procs.length){ wrap.innerHTML = '<div class="empty-state">Процессы пока не описаны. Шаблон: название → цель → триггер → шаги → владелец → метрика → где ограничение → системы.</div>'; return; }
  const byDept = {};
  procs.forEach(p => { (byDept[p.department_id || ''] = byDept[p.department_id || ''] || []).push(p); });
  wrap.innerHTML = Object.entries(byDept).map(([dId, list]) => `<div class="role-section"><h2>${esc(dId ? deptName(dId) : 'Общие')}</h2>
    <div class="proc-grid">${list.map(p => `<article class="proc-card" data-proc="${p.id}" tabindex="0">
      <h3>${esc(p.title)}</h3>
      ${p.goal ? `<p class="muted">${esc(p.goal)}</p>` : ''}
      <div class="proc-meta">
        ${p.owner_id ? `<span>владелец: <b>${esc(empName(p.owner_id))}</b></span>` : '<span class="muted">владелец не назначен</span>'}
        ${(p.participants || []).length ? `<span>участники: ${p.participants.map(empName).map(esc).join(', ')}</span>` : ''}
        ${p.metric ? `<span>метрика: ${esc(p.metric)}</span>` : ''}
        ${p.constraint_note ? pill('ограничение: ' + p.constraint_note, 'warn') : ''}
      </div>
    </article>`).join('')}</div></div>`).join('');
}

export function openProcess(id){
  const p = HR.processes.find(x => x.id === id); if (!p) return;
  const steps = (p.steps || '').split('\n').map(s => s.trim()).filter(Boolean);
  openDrawer(`
    <div class="p-hd">
      <button class="drawer-close icon-btn" title="Закрыть">×</button>
      <div class="nm">${esc(p.title)}</div>
      <div class="rl">${p.department_id ? esc(deptName(p.department_id)) : 'Общий процесс'}</div>
      ${isAdmin() ? `<div class="p-actions"><button class="mini-btn" data-edit-proc="${p.id}">Редактировать</button></div>` : ''}
    </div>
    <div class="p-body">
      ${p.goal ? `<div class="p-sub">Цель</div><p class="note-text">${esc(p.goal)}</p>` : ''}
      ${p.trigger_text ? `<div class="p-sub">Триггер</div><p class="note-text">${esc(p.trigger_text)}</p>` : ''}
      ${steps.length ? `<div class="p-sub">Шаги</div><ol class="steps">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
      <div class="p-sub">Роли</div>
      <dl class="kv">
        <dt>Владелец</dt><dd>${p.owner_id ? `<button class="link-btn" data-emp="${p.owner_id}">${esc(empName(p.owner_id))}</button>` : '—'}</dd>
        <dt>Участники</dt><dd>${(p.participants || []).length ? p.participants.map(id => `<button class="link-btn" data-emp="${id}">${esc(empName(id))}</button>`).join(', ') : '—'}</dd>
      </dl>
      <div class="p-sub">Контроль</div>
      <dl class="kv">
        <dt>Метрика</dt><dd>${esc(p.metric || '—')}</dd>
        <dt>Где ограничение</dt><dd>${esc(p.constraint_note || '—')}</dd>
        <dt>Системы</dt><dd>${esc(p.systems || '—')}</dd>
        <dt>Схема</dt><dd>${linkOrDash(p.link, 'Открыть схему')}</dd>
      </dl>
    </div>`);
}

function procForm(p){
  openForm({
    title: p ? p.title : 'Новый процесс',
    fields: [
      { key: 'title', label: 'Название', type: 'text', required: true, width: 'full' },
      { key: 'goal', label: 'Цель', type: 'textarea', rows: 2, width: 'full' },
      { key: 'trigger_text', label: 'Триггер (что запускает процесс)', type: 'text', width: 'full' },
      { key: 'steps', label: 'Шаги (по одному на строку)', type: 'textarea', rows: 6, width: 'full' },
      { key: 'department_id', label: 'Отдел', type: 'select', options: deptOpts() },
      { key: 'owner_id', label: 'Владелец', type: 'select', options: empOpts() },
      { key: 'participants', label: 'Участники', type: 'multiselect', options: empOpts(), width: 'full' },
      { key: 'metric', label: 'Метрика', type: 'text' },
      { key: 'constraint_note', label: 'Где ограничение', type: 'text' },
      { key: 'systems', label: 'Системы', type: 'text', placeholder: 'Bitrix24, сайт, ЛК партнёра' },
      { key: 'link', label: 'Ссылка на схему (BPMN / Miro / Notion)', type: 'url' },
      { key: 'sort', label: 'Порядок', type: 'number' },
    ],
    values: p || { sort: 100 },
    onSave: async v => { if (p) v.id = p.id; if (v.sort == null) v.sort = 100; const [row] = await upsert('processes', v); renderProcs(); openProcess(row.id); },
    onDelete: p ? async () => { await remove('processes', { id: p.id }); renderProcs(); document.getElementById('drawer').hidden = true; } : null,
  });
}

document.addEventListener('click', e => {
  if (e.target.closest('#addRegBtn')){ regForm(null); return; }
  const er = e.target.closest('[data-edit-reg]');
  if (er && !e.target.closest('a')){ regForm(HR.regulations.find(r => r.id === er.dataset.editReg)); return; }
  if (e.target.closest('#addProcBtn')){ procForm(null); return; }
  const ep = e.target.closest('[data-edit-proc]');
  if (ep){ procForm(HR.processes.find(p => p.id === ep.dataset.editProc)); return; }
  const pc = e.target.closest('[data-proc]');
  if (pc){ openProcess(pc.dataset.proc); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-proc]')) openProcess(e.target.dataset.proc);
});
