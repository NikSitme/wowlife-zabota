// Общие элементы интерфейса: модальная форма, боковая панель, подтверждение.
import { esc } from './db.js';

const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');
let modalState = null;

/**
 * openForm({ title, fields, values, onSave, onDelete, deleteLabel })
 * field: { key, label, type: text|textarea|date|number|select|multiselect|lines|checkbox, options:[{value,label}], hint, required, width }
 * lines: массив строк — по одной на строку textarea.
 */
export function openForm(cfg){
  modalState = cfg;
  modalTitle.textContent = cfg.title || '';
  const v = cfg.values || {};
  modalBody.innerHTML = `<form id="modalForm" class="form-grid">` + cfg.fields.map(f => {
    const val = v[f.key];
    const id = 'f_' + f.key;
    let ctl = '';
    if (f.type === 'textarea' || f.type === 'lines'){
      const text = f.type === 'lines' ? (Array.isArray(val) ? val.join('\n') : '') : (val ?? '');
      ctl = `<textarea id="${id}" name="${f.key}" rows="${f.rows || 4}">${esc(text)}</textarea>`;
    } else if (f.type === 'select'){
      ctl = `<select id="${id}" name="${f.key}">` + (f.allowEmpty !== false ? `<option value="">—</option>` : '') +
        f.options.map(o => `<option value="${esc(o.value)}"${String(val ?? '') === String(o.value) ? ' selected' : ''}>${esc(o.label)}</option>`).join('') + `</select>`;
    } else if (f.type === 'multiselect'){
      const set = new Set(Array.isArray(val) ? val : []);
      ctl = `<div class="check-list" data-multi="${f.key}">` + f.options.map(o =>
        `<label class="check-item"><input type="checkbox" value="${esc(o.value)}"${set.has(o.value) ? ' checked' : ''}> ${esc(o.label)}</label>`).join('') + `</div>`;
    } else if (f.type === 'checkbox'){
      ctl = `<label class="check-item"><input type="checkbox" id="${id}" name="${f.key}"${val ? ' checked' : ''}> ${esc(f.checkLabel || '')}</label>`;
    } else {
      ctl = `<input id="${id}" name="${f.key}" type="${f.type || 'text'}" value="${esc(val ?? '')}"${f.required ? ' required' : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}>`;
    }
    return `<div class="form-field${f.width === 'full' ? ' full' : ''}"><label for="${id}">${esc(f.label)}${f.required ? ' *' : ''}</label>${ctl}${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''}</div>`;
  }).join('') + `
    <div class="form-actions full">
      <button type="submit" class="sync-btn">Сохранить</button>
      <button type="button" class="mini-btn" data-act="cancel">Отмена</button>
      ${cfg.onDelete ? `<button type="button" class="mini-btn danger" data-act="delete">${esc(cfg.deleteLabel || 'Удалить')}</button>` : ''}
      <span class="form-error" id="formError"></span>
    </div></form>`;
  modal.hidden = false;
  const first = modalBody.querySelector('input,textarea,select'); if (first) first.focus();
}
export function closeModal(){ modal.hidden = true; modalState = null; }

function collect(){
  const out = {};
  modalState.fields.forEach(f => {
    if (f.type === 'multiselect'){
      out[f.key] = Array.from(modalBody.querySelectorAll(`[data-multi="${f.key}"] input:checked`)).map(i => i.value);
    } else if (f.type === 'checkbox'){
      out[f.key] = modalBody.querySelector(`#f_${f.key}`).checked;
    } else if (f.type === 'lines'){
      out[f.key] = modalBody.querySelector(`#f_${f.key}`).value.split('\n').map(s => s.trim()).filter(Boolean);
    } else {
      const el = modalBody.querySelector(`#f_${f.key}`);
      let val = el.value;
      if (f.type === 'number') val = val === '' ? null : Number(val);
      else if (val === '') val = null;
      out[f.key] = val;
    }
  });
  return out;
}

modal.addEventListener('click', async e => {
  if (e.target === modal || e.target.closest('[data-act="cancel"]') || e.target.closest('.modal-close')){ closeModal(); return; }
  const del = e.target.closest('[data-act="delete"]');
  if (del && modalState && modalState.onDelete){
    if (!confirm(modalState.deleteConfirm || 'Удалить запись?')) return;
    try { await modalState.onDelete(); closeModal(); } catch(err){ showFormError(err); }
  }
});
modalBody.addEventListener('submit', async e => {
  e.preventDefault();
  if (!modalState) return;
  const btn = modalBody.querySelector('button[type=submit]'); btn.disabled = true;
  try { await modalState.onSave(collect()); closeModal(); }
  catch(err){ showFormError(err); }
  finally { btn.disabled = false; }
});
function showFormError(err){ const el = document.getElementById('formError'); if (el) el.textContent = (err && err.message) || String(err); }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

/* ---------- боковая панель (карточка) ---------- */
const drawer = document.getElementById('drawer');
export function openDrawer(html){ document.getElementById('drawerBody').innerHTML = html; drawer.hidden = false; drawer.scrollTop = 0; }
export function closeDrawer(){ drawer.hidden = true; }
drawer.addEventListener('click', e => { if (e.target.closest('.drawer-close')) closeDrawer(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden && modal.hidden) closeDrawer(); });

/* ---------- мелочи ---------- */
export function linkOrDash(url, label){
  if (!url) return '<span class="muted">не указано</span>';
  return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label || 'Открыть')} ↗</a>`;
}
export function pill(text, cls){ return `<span class="pill ${cls || ''}">${esc(text)}</span>`; }
