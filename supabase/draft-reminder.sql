-- Velune Letters · daily draft reminder. Run once in Supabase → SQL Editor.
-- 1) remember who was already reminded
alter table public.invitations add column if not exists reminded_at timestamptz;
-- 2) run the draft-reminder function every day at 18:00 UTC
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('velune-draft-reminder', '0 18 * * *', $$
  select net.http_post(
    url := 'https://hotkkzulmgmrmqzmvvsg.supabase.co/functions/v1/draft-reminder',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb);
$$);
