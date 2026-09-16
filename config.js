// Подключение к Supabase. Оба значения публичные: URL проекта и anon-ключ.
// Их можно взять в Supabase: Project Settings → API. Сервисный (service_role) ключ сюда НЕ класть.
window.ZABOTA_CONFIG = {
  url: 'https://zdmhrtwdsreznsjmdads.supabase.co',
  anonKey: 'sb_publishable_fe5iiKS113rcWQqWGBGNuQ_ukc-5dSE',
  // true — без экрана входа, все, у кого есть ссылка, правят всё (нужен supabase/004_open_access.sql).
  // false — вход по email и паролю, роли из allowed_users (нужен supabase/005_close_access.sql).
  openAccess: true,
};
