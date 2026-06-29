-- Usuário dev para login no app (após migration + seed)
-- E-mail: editor.igreja.dev@gmail.com | Senha: Igreja123!

UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'editor.igreja.dev@gmail.com';

INSERT INTO profiles (id, church_id, role, name, email)
SELECT
  u.id,
  '00000000-0000-4000-8000-000000000001',
  'editor',
  'Editor Dev',
  'editor.igreja.dev@gmail.com'
FROM auth.users u
WHERE u.email = 'editor.igreja.dev@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  church_id = EXCLUDED.church_id,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  email = EXCLUDED.email;
