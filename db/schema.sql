-- Loads available for booking
create table loads (
  load_id           text primary key,
  origin            text not null,
  destination       text not null,
  pickup_datetime   timestamptz not null,
  delivery_datetime timestamptz not null,
  equipment_type    text not null,
  loadboard_rate    numeric(10,2) not null,
  notes             text,
  weight            integer,
  commodity_type    text,
  num_of_pieces     integer,
  miles             integer,
  dimensions        text,
  created_at        timestamptz default now()
);

create index idx_loads_origin       on loads (origin);
create index idx_loads_destination  on loads (destination);
create index idx_loads_equipment    on loads (equipment_type);
create index idx_loads_pickup       on loads (pickup_datetime);

-- Each row = one completed call. The HR session_id is the natural upsert
-- key for webhooks; call_id is OUR human-friendly identifier (format
-- CL{uuid}) auto-generated on insert and never sent in by HR.
create table calls (
  id                  uuid primary key default gen_random_uuid(),
  call_id             text unique default ('CL' || gen_random_uuid()::text),
  mc_number           text,
  carrier_name        text,
  load_id             text references loads(load_id) on delete set null on update cascade,
  outcome             text not null check (outcome in (
                        'booked',
                        'declined_by_carrier',
                        'no_agreement',
                        'carrier_ineligible',
                        'no_matching_load',
                        'abandoned'
                      )),
  sentiment           text check (sentiment in ('positive','neutral','negative')),
  initial_rate        numeric(10,2),
  final_rate          numeric(10,2),
  num_offers          integer default 0,
  transcript_summary  text,
  -- Operational metadata captured by the HR workflow webhook.
  duration_seconds    integer,
  caller_number       text,
  decline_reason      text,
  -- HR session_id — the upsert key for webhook ingestion. Also used as
  -- the key for the in-memory negotiation round counter so a live
  -- negotiation can be linked back to the recorded call after the fact.
  session_id          text unique,
  -- AI extraction fields populated by the HappyRobot workflow's extract/classify
  -- nodes. They post these alongside the raw fields on POST /calls.
  ai_summary          text,
  ai_classification   text,
  ai_topics           text[],
  ai_follow_up        boolean,
  ai_extracted_at     timestamptz,
  created_at          timestamptz default now()
);

create index idx_calls_outcome           on calls (outcome);
create index idx_calls_created           on calls (created_at desc);
create index idx_calls_load              on calls (load_id);
create index idx_calls_ai_classification on calls (ai_classification);
create index idx_calls_ai_topics_gin     on calls using gin (ai_topics);
-- session_id index is implicit via the unique constraint on the column.

-- RLS: API uses service_role key (bypasses RLS).
-- Dashboard uses anon key with read-only access.
alter table loads enable row level security;
alter table calls enable row level security;

create policy "anon read loads" on loads for select using (true);
create policy "anon read calls" on calls for select using (true);
