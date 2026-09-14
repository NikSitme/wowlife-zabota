// Точка входа: тема, вход, навигация, загрузка данных, realtime.
import { sb, setSync, session, isAdmin, getSession, signIn, signOut, loadRole, loadHR, onHRChange, startHRRealtime, esc } from './db.js';
import { renderAll as renderPeople, refreshCard } from './people.js';
import { renderSchedule } from './schedule.js';
import { renderRegs, renderProcs } from './docs.js';

/* ---------- тема ---------- */
const THEME_KEY = 'payroll_care_theme_v1';
const themeToggleBtn = document.getElementById('themeToggle');
function effectiveTheme(){
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function syncThemeIcon(){ themeToggleBtn.classList.toggle('is-dark', effectiveTheme() === 'dark'); }
function setTheme(theme){
  document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
  syncThemeIcon();
}
themeToggleBtn.addEventListener('click', () => setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark'));
try { const t = localStorage.getItem(THEME_KEY); if (t === 'light' || t === 'dark') setTheme(t); else syncThemeIcon(); } catch(e){ syncThemeIcon(); }

/* ---------- навигация ---------- */
const PAGES = ['org', 'people', 'schedule', 'regs', 'procs', 'payroll', 'help'];
let currentPage = 'org';
function showPage(p){
  if (!PAGES.includes(p)) p = 'org';
  if (p === 'payroll' && !isAdmin()) p = 'org';
  currentPage = p;
  document.querySelectorAll('#mainNav .nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === p));
  document.querySelectorAll('.page').forEach(s => s.classList.toggle('active', s.dataset.page === p));
  try { history.replaceState(null, '', '#' + p); } catch(e){}
  if (p === 'payroll') import('./payroll.js').then(m => m.initPayroll()).catch(e => console.error(e));
}
document.getElementById('mainNav').addEventListener('click', e => { const b = e.target.closest('.nav-btn'); if (b) showPage(b.dataset.page); });

/* ---------- отрисовка всего ---------- */
function renderPage(key){
  if (!key || key === 'employees' || key === 'departments'){ renderPeople(); renderSchedule(); renderRegs(); renderProcs(); }
  else if (key === 'shifts') renderSchedule();
  else if (key === 'regulations'){ renderRegs(); refreshCard(); }
  else if (key === 'processes'){ renderProcs(); refreshCard(); }
}

/* ---------- вход ---------- */
const authScreen = document.getElementById('authScreen');
const appRoot = document.getElementById('appRoot');
function showAuth(msg){
  authScreen.hidden = false; appRoot.hidden = true;
  document.getElementById('authError').textContent = msg || '';
}
document.getElementById('authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const pass = document.getElementById('authPass').value;
  const btn = e.target.querySelector('button'); btn.disabled = true;
  document.getElementById('authError').textContent = '';
  try { await signIn(email, pass); await enter(); }
  catch(err){ document.getElementById('authError').textContent = /invalid/i.test(err.message) ? 'Неверный email или пароль' : err.message; }
  finally { btn.disabled = false; }
});
document.getElementById('signOutBtn').addEventListener('click', async () => { await signOut(); location.hash = ''; showAuth(); });

async function enter(){
  setSync('busy', 'Загружаю…');
  const role = await loadRole();
  if (!role){
    await signOut();
    showAuth('Этому email не выдан доступ. Попросите администратора добавить вас в список.');
    return;
  }
  document.getElementById('userBadge').textContent = `${session.user.email} · ${role === 'admin' ? 'администратор' : 'просмотр'}`;
  document.querySelector('#mainNav .nav-btn[data-page="payroll"]').hidden = !isAdmin();
  document.body.classList.toggle('is-admin', isAdmin());
  try { await loadHR(); }
  catch(e){ setSync('error', 'Не удалось загрузить данные: ' + (e.message || e)); authScreen.hidden = true; appRoot.hidden = false; return; }
  authScreen.hidden = true; appRoot.hidden = false;
  renderPage();
  setSync('ok', 'Сохранено');
  showPage((location.hash || '#org').slice(1));
  startHRRealtime();
}
onHRChange(renderPage);

/* ---------- старт ---------- */
(async () => {
  if (!sb){ showAuth('Подключение к базе не настроено: заполните config.js'); return; }
  const user = await getSession();
  if (user) await enter(); else showAuth();
  sb.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT'){ showAuth(); } });
})();
