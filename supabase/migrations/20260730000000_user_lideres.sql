-- Vínculo membro -> líder(es): um usuário pode indicar um ou mais líderes
create table user_lideres (
  user_id    uuid not null references users(id) on delete cascade,
  lider_id   uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lider_id)
);

create index user_lideres_lider_id_idx on user_lideres(lider_id);

alter table user_lideres enable row level security;

-- Cada usuário gerencia apenas seus próprios vínculos de liderança
create policy "user manages own lideres"
  on user_lideres for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
