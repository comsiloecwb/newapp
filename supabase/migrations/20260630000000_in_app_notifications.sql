-- Tabela de notificações in-app por usuário/igreja
create type in_app_notification_type as enum (
  'event_created',
  'new_message',
  'event_reminder',
  'announcement'
);

create table in_app_notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  church_id     uuid not null references churches(id) on delete cascade,
  type          in_app_notification_type not null,
  title         text not null,
  body          text not null,
  reference_id  uuid,
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);

create index in_app_notifications_user_id_idx on in_app_notifications(user_id, created_at desc);
create index in_app_notifications_church_id_idx on in_app_notifications(church_id);

-- RLS: usuário só vê as próprias notificações
alter table in_app_notifications enable row level security;

create policy "user sees own notifications"
  on in_app_notifications for select
  using (auth.uid() = user_id);

create policy "user updates own notifications"
  on in_app_notifications for update
  using (auth.uid() = user_id);

-- Função que cria notificações para todos os membros de uma igreja
create or replace function create_church_notifications(
  p_church_id   uuid,
  p_type        in_app_notification_type,
  p_title       text,
  p_body        text,
  p_ref_id      uuid default null
) returns void language plpgsql security definer as $$
begin
  insert into in_app_notifications (user_id, church_id, type, title, body, reference_id)
  select p.id, p_church_id, p_type, p_title, p_body, p_ref_id
  from profiles p
  where p.church_id = p_church_id;
end;
$$;

-- Trigger: novo evento publicado
create or replace function trigger_event_notification() returns trigger language plpgsql security definer as $$
begin
  -- Só dispara quando published muda de false para true
  if (TG_OP = 'INSERT' and NEW.published = true) or
     (TG_OP = 'UPDATE' and OLD.published = false and NEW.published = true) then
    perform create_church_notifications(
      NEW.church_id,
      'event_created',
      'Novo evento: ' || NEW.title,
      coalesce(NEW.description, 'Confira os detalhes do evento.'),
      NEW.id
    );
  end if;
  return NEW;
end;
$$;

create trigger on_event_published
  after insert or update of published on events
  for each row execute function trigger_event_notification();

-- Trigger: nova mensagem semanal publicada
create or replace function trigger_message_notification() returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT' and NEW.published = true) or
     (TG_OP = 'UPDATE' and OLD.published = false and NEW.published = true) then
    perform create_church_notifications(
      NEW.church_id,
      'new_message',
      'Nova palavra: ' || NEW.title,
      coalesce(NEW.content, 'Uma nova mensagem foi publicada.'),
      NEW.id
    );
  end if;
  return NEW;
end;
$$;

create trigger on_message_published
  after insert or update of published on weekly_messages
  for each row execute function trigger_message_notification();
