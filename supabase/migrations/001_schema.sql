create table leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  city text,
  address text,
  level text check (level in ('BASE','LUXE','ATELIER')),
  status text check (status in ('NEW','AUDITED','CONTACTED','CALLED','CLOSED','CLIENT')) default 'NEW',
  grid_score_before int,
  created_at timestamptz default now()
);

create table audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  grid_data jsonb,
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  plan text check (plan in ('BASE','LUXE','ATELIER')),
  mrr int,
  start_date timestamptz default now(),
  created_at timestamptz default now()
);
