-- Grupos da igreja (ministérios/pequenos grupos) e seus membros
create table grupos (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  nome       text not null,
  created_at timestamptz not null default now()
);

create table membros_grupo (
  grupo_id   uuid not null references grupos(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (grupo_id, user_id)
);

create index membros_grupo_user_id_idx on membros_grupo(user_id);

alter table grupos enable row level security;
alter table membros_grupo enable row level security;

-- Usuário só vê grupos dos quais participa
create policy "user sees own grupos"
  on grupos for select
  using (
    id in (select grupo_id from membros_grupo where user_id = auth.uid())
  );

-- Membros de um grupo veem todos os vínculos daquele grupo (necessário para listar os colegas)
create policy "group members see membership"
  on membros_grupo for select
  using (
    grupo_id in (select grupo_id from membros_grupo where user_id = auth.uid())
  );
