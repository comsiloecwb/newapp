-- App Igreja — schema MVP + RLS
-- PRD: multi-igreja, eventos, inscrições, pagamentos, palavra da semana, push

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'member');
CREATE TYPE registration_status AS ENUM ('confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE scheduled_notification_type AS ENUM (
  'reminder_24h',
  'reminder_1h',
  'event_created'
);

-- Igrejas
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#1E3A5F',
  secondary_color TEXT NOT NULL DEFAULT '#4A90D9',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfis (PRD: users) — ligado ao auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE RESTRICT,
  role user_role NOT NULL DEFAULT 'member',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notify_new_events BOOLEAN NOT NULL DEFAULT true,
  notify_event_reminders BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX profiles_church_id_idx ON profiles(church_id);

-- Palavra da semana
CREATE TABLE weekly_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  preached_at DATE NOT NULL DEFAULT CURRENT_DATE,
  published BOOLEAN NOT NULL DEFAULT false,
  published_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX weekly_messages_church_published_idx ON weekly_messages(church_id, preached_at DESC);

-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  is_paid BOOLEAN NOT NULL DEFAULT false,
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  stripe_price_id TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT events_paid_price CHECK (
    (is_paid = false) OR (is_paid = true AND price_cents IS NOT NULL AND price_cents > 0)
  )
);

CREATE INDEX events_church_start_idx ON events(church_id, start_at);

-- Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  stripe_session_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inscrições
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'confirmed',
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

CREATE INDEX registrations_event_idx ON registrations(event_id);

-- Notificações agendadas (pg_cron → lembretes 24h/1h e evento criado)
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  send_at TIMESTAMPTZ NOT NULL,
  type scheduled_notification_type NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, type)
);

CREATE INDEX scheduled_notifications_pending_idx
  ON scheduled_notifications (send_at)
  WHERE sent_at IS NULL;

CREATE INDEX scheduled_notifications_church_idx ON scheduled_notifications(church_id);

-- Push tokens (Expo)
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, expo_push_token)
);

-- Helpers RLS
CREATE OR REPLACE FUNCTION public.current_profile()
RETURNS profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_church_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER churches_updated_at BEFORE UPDATE ON churches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER weekly_messages_updated_at BEFORE UPDATE ON weekly_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER registrations_updated_at BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- churches: membros leem sua igreja; admin atualiza sua igreja
CREATE POLICY churches_select ON churches FOR SELECT
  USING (id = public.user_church_id());

CREATE POLICY churches_update ON churches FOR UPDATE
  USING (id = public.user_church_id() AND public.user_role() = 'admin');

-- profiles
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (church_id = public.user_church_id());

CREATE POLICY profiles_update_self ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY profiles_admin_all ON profiles FOR ALL
  USING (church_id = public.user_church_id() AND public.user_role() = 'admin');

-- weekly_messages
CREATE POLICY weekly_messages_select ON weekly_messages FOR SELECT
  USING (church_id = public.user_church_id() AND published = true);

CREATE POLICY weekly_messages_editor ON weekly_messages FOR ALL
  USING (
    church_id = public.user_church_id()
    AND public.user_role() IN ('admin', 'editor')
  );

-- events
CREATE POLICY events_select ON events FOR SELECT
  USING (church_id = public.user_church_id() AND published = true);

CREATE POLICY events_staff ON events FOR ALL
  USING (
    church_id = public.user_church_id()
    AND public.user_role() IN ('admin', 'editor')
  );

-- registrations
CREATE POLICY registrations_select ON registrations FOR SELECT
  USING (church_id = public.user_church_id());

CREATE POLICY registrations_insert ON registrations FOR INSERT
  WITH CHECK (
    church_id = public.user_church_id()
    AND user_id = auth.uid()
  );

CREATE POLICY registrations_update_own ON registrations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY registrations_admin ON registrations FOR SELECT
  USING (church_id = public.user_church_id() AND public.user_role() = 'admin');

-- payments
CREATE POLICY payments_select_own ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY payments_admin ON payments FOR SELECT
  USING (church_id = public.user_church_id() AND public.user_role() = 'admin');

-- push_tokens
CREATE POLICY push_tokens_own ON push_tokens FOR ALL
  USING (user_id = auth.uid());

-- scheduled_notifications (staff gerencia; pg_cron usa service role)
CREATE POLICY scheduled_notifications_staff ON scheduled_notifications FOR ALL
  USING (
    church_id = public.user_church_id()
    AND public.user_role() IN ('admin', 'editor')
  );

-- Storage buckets (criar no dashboard ou via API)
-- church-logos, event-covers, weekly-messages
