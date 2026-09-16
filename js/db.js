// Общий слой: клиент Supabase, вход, роль, кэш справочников управленки, realtime.

const CFG = window.ZABOTA_CONFIG || {};
export const OPEN = !!CFG.openAccess; // режим без входа
export const sb = (CFG.url && CFG.anonKey && window.supabase)
  ? window.supabase.createClient(CFG.url, CFG.anonKey)
  : null;

/* ---------- индикатор синхронизации (левый нижний угол) ---------- */
const syncEl = document.getElementById('syncStatus');
export function setSync(kind, text){ if (syncEl){ syncEl.className = 'sync-pill ' + kind; syncEl.textContent = text; } }

/* ---------- утилиты ---------- */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
export const MONTHS_NOM = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
export function fmtDate(iso){ if (!iso) return '—'; const [y,m,d] = iso.split('-').map(Number); return `${d} ${MONTHS_GEN[m-1]} ${y}`; }
export function fmtDateShort(iso){ if (!iso) return '—'; const [y,m,d] = iso.split('-').map(Number); return `${String(d).padStart(2,'0')}.${String(m).padStart(2,'0')}.${y}`; }
export function todayISO(){ const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`; }
export function tenure(iso, until){
  if (!iso) return null;
  const s = new Date(iso + 'T00:00:00'); const e = until ? new Date(until + 'T00:00:00') : new Date();
  let m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (e.getDate() < s.getDate()) m--;
  if (m < 0) return 'ещё не вышел';
  const y = Math.floor(m / 12), mm = m % 12;
  if (y === 0) return mm === 0 ? 'меньше месяца' : `${mm} мес.`;
  return `${y} ${y === 1 ? 'год' : (y < 5 ? 'года' : 'лет')}${mm ? ` ${mm} мес.` : ''}`;
}
export const STATUS_LABEL = { active: 'Работает', former: 'Не работает', contractor: 'Подрядчик' };
export const CONTRACT_LABEL = { 'ТК': 'Трудовой договор', 'ГПХ': 'Договор ГПХ', 'СЗ': 'Самозанятый', 'ИП': 'ИП' };

/* ---------- сессия и роль ---------- */
export const session = { user: null, role: null, employeeId: null };
export const isAdmin = () => session.role === 'admin';

export async function getSession(){
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  session.user = data.session ? data.session.user : null;
  return session.user;
}
export async function signIn(email, password){
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  session.user = data.user;
  return data.user;
}
export async function signOut(){ await sb.auth.signOut(); session.user = null; session.role = null; }

// Роль читаем из allowed_users; если строки нет — доступа нет
export async function loadRole(){
  if (OPEN){ session.role = 'admin'; return 'admin'; }
  const { data, error } = await sb.from('allowed_users').select('role,employee_id').ilike('email', session.user.email).maybeSingle();
  if (error){ console.error('allowed_users', error); session.role = null; return null; }
  session.role = data ? data.role : null;
  session.employeeId = data ? data.employee_id : null;
  return session.role;
}

/* ---------- кэш управленки ---------- */
export const HR = { departments: [], employees: [], regulations: [], processes: [], shifts: [] };
const TABLES = {
  departments: 'departments', employees: 'employees', regulations: 'regulations',
  processes: 'processes', shifts: 'support_shifts',
};
const ORDER = { departments: 'sort', employees: 'full_name', regulations: 'sort', processes: 'sort', shifts: 'day' };

export async function loadTable(key){
  const { data, error } = await sb.from(TABLES[key]).select('*').order(ORDER[key], { ascending: true }).limit(5000);
  if (error){ console.error(key, error); throw error; }
  HR[key] = data || [];
  return HR[key];
}
export async function loadHR(){
  await Promise.all(Object.keys(TABLES).map(loadTable));
  return HR;
}

export const empById = id => HR.employees.find(e => e.id === id) || null;
export const deptById = id => HR.departments.find(d => d.id === id) || null;
export const empName = id => { const e = empById(id); return e ? (e.short_name || e.full_name) : '—'; };
export const deptName = id => { const d = deptById(id); return d ? d.name : '—'; };
export const activeEmployees = () => HR.employees.filter(e => e.status !== 'former');

/* ---------- запись ---------- */
export async function upsert(key, row){
  const { data, error } = await sb.from(TABLES[key]).upsert(row).select();
  if (error) throw error;
  await loadTable(key);
  return data;
}
export async function remove(key, match){
  let q = sb.from(TABLES[key]).delete();
  Object.entries(match).forEach(([k, v]) => { q = q.eq(k, v); });
  const { error } = await q;
  if (error) throw error;
  await loadTable(key);
}

/* ---------- realtime: любая правка справочников → перечитать таблицу и перерисовать ---------- */
let listeners = [];
export function onHRChange(fn){ listeners.push(fn); }
export function startHRRealtime(){
  if (!sb) return;
  const ch = sb.channel('hr_changes');
  Object.entries(TABLES).forEach(([key, table]) => {
    ch.on('postgres_changes', { event: '*', schema: 'public', table }, async () => {
      try { await loadTable(key); listeners.forEach(fn => fn(key)); } catch(e){ console.error(e); }
    });
  });
  ch.subscribe();
}

/* ---------- обработка ошибок записи ---------- */
export function reportError(e, what){
  console.error(what, e);
  const msg = (e && e.message) || String(e);
  setSync('error', `${what}: ${msg}`);
  setTimeout(() => setSync('ok', 'Сохранено'), 6000);
}
