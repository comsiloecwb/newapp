-- Helper: returns the church_id of the authenticated user (avoids recursive RLS)
create or replace function auth_church_id()
returns uuid language sql stable security definer as $$
  select church_id from profiles where id = auth.uid()
$$;

-- Allow church members to see each other's basic profile
create policy "church members see profiles"
  on profiles for select
  using (church_id = auth_church_id());

-- Study groups (created by any member)
create table if not exists study_groups (
  id           uuid primary key default gen_random_uuid(),
  church_id    uuid references churches,
  created_by   uuid references auth.users not null,
  name         text not null,
  description  text,
  invite_code  text unique not null,
  created_at   timestamptz default now()
);

-- Group membership
create table if not exists study_group_members (
  group_id   uuid references study_groups on delete cascade not null,
  user_id    uuid references auth.users not null,
  joined_at  timestamptz default now(),
  primary key (group_id, user_id)
);

-- Daily completion per group member (visible to all group members)
create table if not exists group_day_completions (
  group_id      uuid references study_groups on delete cascade not null,
  user_id       uuid references auth.users not null,
  day_number    int not null,
  completed_at  timestamptz default now(),
  primary key (group_id, user_id, day_number)
);

alter table study_groups          enable row level security;
alter table study_group_members   enable row level security;
alter table group_day_completions enable row level security;

-- Groups: members can read, authenticated users can create
create policy "group members can read"
  on study_groups for select
  using (
    id in (select group_id from study_group_members where user_id = auth.uid())
  );

create policy "authenticated users create groups"
  on study_groups for insert
  with check (auth.uid() = created_by);

create policy "creator can update group"
  on study_groups for update
  using (auth.uid() = created_by);

-- Members: readable by fellow members, anyone can join (insert self)
create policy "group members see membership"
  on study_group_members for select
  using (
    group_id in (select group_id from study_group_members where user_id = auth.uid())
  );

create policy "authenticated users can join"
  on study_group_members for insert
  with check (auth.uid() = user_id);

create policy "members can leave"
  on study_group_members for delete
  using (auth.uid() = user_id);

-- Completions: readable by group members, writable by self
create policy "group members see completions"
  on group_day_completions for select
  using (
    group_id in (select group_id from study_group_members where user_id = auth.uid())
  );

create policy "members manage own completions"
  on group_day_completions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
