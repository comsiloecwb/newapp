-- Check-in: add checked_in_at to registrations
alter table registrations
  add column if not exists checked_in_at timestamptz default null;

-- Members can update their own check-in
create policy "members can check in themselves"
  on registrations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
