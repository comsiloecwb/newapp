-- Seed dev: uma igreja + palavra + eventos de exemplo

INSERT INTO churches (id, name, slug, primary_color, secondary_color)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Igreja Exemplo',
  'igreja-exemplo',
  '#1E3A5F',
  '#4A90D9'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO weekly_messages (church_id, title, content, preached_at, published)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Palavra da semana',
  'Conteúdo da mensagem do último culto.',
  CURRENT_DATE,
  true
);

INSERT INTO events (
  church_id, title, description, start_at, end_at, location, is_paid, price_cents, published
)
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    'Culto de domingo',
    'Celebração semanal',
    date_trunc('week', now()) + interval '6 days 19 hours',
    date_trunc('week', now()) + interval '6 days 21 hours',
    'Templo principal',
    false,
    NULL,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    'Retiro jovem',
    'Inscrição limitada — evento pago de exemplo',
    now() + interval '14 days',
    now() + interval '14 days 8 hours',
    'Sítio da igreja',
    true,
    5000,
    true
  );

-- Após criar usuário no Supabase Auth:
-- INSERT INTO profiles (id, church_id, role, name, email)
-- VALUES ('<auth-user-uuid>', '00000000-0000-4000-8000-000000000001', 'editor', 'Nome', 'email@igreja.com');
