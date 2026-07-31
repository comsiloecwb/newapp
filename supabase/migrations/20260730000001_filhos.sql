-- Filhos de membros: cadastro para dados de kids/eventos futuros
create table filhos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  nome             text not null,
  data_nascimento  date not null,
  created_at       timestamptz not null default now()
);

create index filhos_user_id_idx on filhos(user_id);

alter table filhos enable row level security;

create policy "user selects own filhos"
  on filhos for select
  using (auth.uid() = user_id);

-- Só membros aprovados podem cadastrar filhos
create policy "member inserts own filhos"
  on filhos for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from users u where u.id = auth.uid() and u.role = 'member')
  );

create policy "user updates own filhos"
  on filhos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user deletes own filhos"
  on filhos for delete
  using (auth.uid() = user_id);

-- Limite de 10 filhos por usuário (espelha a validação do frontend)
create or replace function check_max_filhos() returns trigger language plpgsql as $$
begin
  if (select count(*) from filhos where user_id = NEW.user_id) >= 10 then
    raise exception 'Limite máximo de 10 filhos por usuário atingido';
  end if;
  return NEW;
end;
$$;

create trigger filhos_max_limit
  before insert on filhos
  for each row execute function check_max_filhos();
