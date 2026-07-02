create table if not exists reading_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  plan_id     text not null,
  day_number  int  not null,
  completed_at timestamptz default now(),
  unique (user_id, plan_id, day_number)
);

alter table reading_progress enable row level security;

create policy "users manage own progress"
  on reading_progress for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
