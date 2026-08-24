-- Cookie's conversation log for the portfolio.
--
-- Run this in the Supabase SQL editor of the project you want the history in:
--   https://supabase.com/dashboard/org/mpqifledagadcnyzxdzi
--   → pick the project → SQL Editor → New query → paste → Run
--
-- Then send me the project's URL and publishable key and I'll wire it up.
-- (Project Settings → API → Project URL, and the "publishable" key.)

create table if not exists public.portfolio_conversations (
  id          uuid primary key default gen_random_uuid(),
  session_id  text        not null,
  messages    jsonb       not null,
  created_at  timestamptz not null default now()
);

create index if not exists portfolio_conversations_session_idx
  on public.portfolio_conversations (session_id, created_at desc);

alter table public.portfolio_conversations enable row level security;

-- INSERT only, and deliberately no SELECT policy.
--
-- The publishable key ships to a public website, so anyone can read it out of
-- the network tab. With a SELECT policy they could then dump every visitor's
-- conversation. Without one, the key can write and can never read back.
--
-- This is also why the table is append-only rather than one row per session:
-- PostgREST's upsert needs SELECT to resolve ON CONFLICT. Each exchange inserts
-- a new row holding the whole transcript so far, so the newest row per
-- session_id is the complete conversation.
create policy portfolio_conversations_insert
  on public.portfolio_conversations
  for insert
  with check (true);

comment on table public.portfolio_conversations is
  'Visitor conversations with Cookie. Messages and timestamps only - no IP, no device, no location. Disclosed to visitors in the chat panel.';


-- ---------------------------------------------------------------------------
-- Reading it back (run these in the SQL editor, where you are authenticated
-- and RLS does not apply to you).

-- Every conversation, newest first, one row per session:
--
--   select distinct on (session_id)
--          session_id,
--          created_at,
--          jsonb_array_length(messages) as turns,
--          messages
--   from public.portfolio_conversations
--   order by session_id, created_at desc;

-- Just the questions people asked:
--
--   select created_at, m->>'content' as question
--   from public.portfolio_conversations,
--        lateral jsonb_array_elements(messages) m
--   where m->>'role' = 'user'
--   order by created_at desc;
