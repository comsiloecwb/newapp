-- =============================================================
-- SEED DE DESENVOLVIMENTO — App Igreja
-- Roda no Supabase SQL Editor (uma vez)
-- =============================================================

-- Igreja principal
INSERT INTO churches (id, name, slug, primary_color, secondary_color)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Igreja Exemplo',
  'igreja-exemplo',
  '#1C1917',
  '#C9954A'
)
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color;

-- ---------------------------------------------------------------
-- Palavra da Semana (publicada)
-- ---------------------------------------------------------------
INSERT INTO weekly_messages (church_id, title, content, preached_at, published)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Confie no Senhor de todo o seu coração',
  'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas. — Provérbios 3:5-6

Neste domingo falamos sobre o que significa realmente confiar em Deus em momentos de incerteza. Confiar não é passividade — é entregar o controle ao único que realmente conhece o fim desde o começo.

Que essa palavra permaneça no seu coração durante a semana.',
  CURRENT_DATE - interval '2 days',
  true
)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------
-- Eventos (datas relativas a NOW() para sempre ficarem válidos)
-- ---------------------------------------------------------------
INSERT INTO events (
  church_id, title, description,
  start_at, end_at, location,
  is_paid, price_cents, capacity, published
)
VALUES

-- Culto de domingo (próximo domingo, às 19h)
(
  '00000000-0000-4000-8000-000000000001',
  'Culto de Domingo',
  'Nossa celebração semanal com louvor, palavra e comunhão. Todos são bem-vindos!',
  date_trunc('week', now()) + interval '6 days 19 hours',
  date_trunc('week', now()) + interval '6 days 21 hours',
  'Templo Principal',
  false, NULL, NULL, true
),

-- Encontro de jovens (em 5 dias)
(
  '00000000-0000-4000-8000-000000000001',
  'Encontro de Jovens',
  'Uma noite de adoração, palavra e conexão para a juventude da igreja. Traga um amigo!',
  now() + interval '5 days 19 hours 30 minutes',
  now() + interval '5 days 22 hours',
  'Salão de Eventos',
  false, NULL, 80, true
),

-- Retiro jovem pago (em 12 dias)
(
  '00000000-0000-4000-8000-000000000001',
  'Retiro Jovem 2025',
  'Um fim de semana de descanso, renovação e palavra. O retiro inclui hospedagem, todas as refeições e materiais de estudo.',
  now() + interval '12 days 8 hours',
  now() + interval '14 days 17 hours',
  'Sítio Hosana — Mairiporã, SP',
  true, 18000, 40, true
),

-- Seminário de finanças pago (em 20 dias)
(
  '00000000-0000-4000-8000-000000000001',
  'Seminário: Finanças com Propósito',
  'Aprenda a administrar seus recursos com sabedoria bíblica. O seminário inclui material impresso e certificado de participação.',
  now() + interval '20 days 9 hours',
  now() + interval '20 days 13 hours',
  'Auditório — 2º andar',
  true, 4500, 60, true
),

-- Culto de oração (em 3 dias)
(
  '00000000-0000-4000-8000-000000000001',
  'Noite de Oração',
  'Venha orar conosco. Uma noite dedicada à intercessão pela cidade, pelas famílias e pela igreja.',
  now() + interval '3 days 20 hours',
  now() + interval '3 days 22 hours',
  'Templo Principal',
  false, NULL, NULL, true
),

-- Culto de domingo seguinte
(
  '00000000-0000-4000-8000-000000000001',
  'Culto de Domingo',
  'Nossa celebração semanal com louvor, palavra e comunhão. Todos são bem-vindos!',
  date_trunc('week', now()) + interval '13 days 19 hours',
  date_trunc('week', now()) + interval '13 days 21 hours',
  'Templo Principal',
  false, NULL, NULL, true
)

ON CONFLICT DO NOTHING;
