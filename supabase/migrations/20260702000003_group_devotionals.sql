-- Group devotionals: created by church leaders, followed by members
create table if not exists group_devotionals (
  id           uuid primary key default gen_random_uuid(),
  church_id    uuid references churches not null,
  title        text not null,
  description  text,
  total_days   int  not null default 7,
  published    boolean default false,
  created_at   timestamptz default now()
);

create table if not exists group_devotional_days (
  id             uuid primary key default gen_random_uuid(),
  devotional_id  uuid references group_devotionals on delete cascade not null,
  day_number     int  not null,
  title          text not null,
  passage        text not null,
  verse          text not null,
  reflection     text not null,
  prayer         text,
  unique (devotional_id, day_number)
);

alter table group_devotionals      enable row level security;
alter table group_devotional_days  enable row level security;

-- Members of a church can read published devotionals
create policy "church members read devotionals"
  on group_devotionals for select
  using (
    published = true
    and church_id in (
      select church_id from profiles where id = auth.uid()
    )
  );

create policy "church members read devotional days"
  on group_devotional_days for select
  using (
    devotional_id in (
      select id from group_devotionals
      where published = true
        and church_id in (
          select church_id from profiles where id = auth.uid()
        )
    )
  );

-- Progress for group devotionals reuses reading_progress
-- (plan_id = group_devotional uuid)
