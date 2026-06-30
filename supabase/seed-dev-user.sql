-- =============================================================
-- SEED DO USUÁRIO DE DESENVOLVIMENTO — App Igreja
-- =============================================================
-- PASSO A PASSO:
--
-- 1. No Supabase Dashboard → Authentication → Users → Add user
--    E-mail:  dev@appigreja.com
--    Senha:   Igreja@2025
--    ✅ Marque "Auto Confirm User"
--
-- 2. Rode este script no SQL Editor
-- =============================================================

-- Confirma o e-mail caso não tenha marcado Auto Confirm
UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at         = now()
WHERE email = 'dev@appigreja.com';

-- Cria o perfil como admin vinculado à Igreja Exemplo
INSERT INTO profiles (id, church_id, role, name, email, notify_new_events, notify_event_reminders)
SELECT
  u.id,
  '00000000-0000-4000-8000-000000000001',
  'admin',
  'Admin Dev',
  'dev@appigreja.com',
  true,
  true
FROM auth.users u
WHERE u.email = 'dev@appigreja.com'
ON CONFLICT (id) DO UPDATE SET
  church_id              = EXCLUDED.church_id,
  role                   = EXCLUDED.role,
  name                   = EXCLUDED.name,
  email                  = EXCLUDED.email;

-- =============================================================
-- Credenciais para usar no app e no painel admin:
--   E-mail:  dev@appigreja.com
--   Senha:   Igreja@2025
--   Código da igreja (registro): igreja-exemplo
-- =============================================================
