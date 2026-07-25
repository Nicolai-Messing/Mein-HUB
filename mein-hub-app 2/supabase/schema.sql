-- Mein Hub — Datenbank-Schema für Supabase
-- Diesen kompletten Inhalt in Supabase unter "SQL Editor" einfügen und ausführen.

create table termine (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  typ text not null default 'Sonstiges',
  person text,
  datum date not null,
  zeit text,
  notiz text,
  erledigt boolean not null default false,
  owner text,
  created_at timestamptz not null default now()
);

create table umsatz (
  id uuid primary key default gen_random_uuid(),
  datum date not null,
  betrag numeric not null,
  art text not null default 'Neu',
  kunde text,
  notiz text,
  owner text,
  created_at timestamptz not null default now()
);

create table team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rolle text,
  manager_id uuid references team(id) on delete set null,
  created_at timestamptz not null default now()
);

create table bewerber (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rolle text,
  status text not null default 'Eingeladen',
  created_at timestamptz not null default now()
);

-- Row Level Security aktivieren
alter table termine enable row level security;
alter table umsatz enable row level security;
alter table team enable row level security;
alter table bewerber enable row level security;

-- Jeder angemeldete Nutzer (du, deine Partnerin, Freunde) darf alle Daten lesen & bearbeiten.
-- Das ist bewusst einfach gehalten für einen kleinen, vertrauten privaten Kreis.
create policy "Angemeldete Nutzer: voller Zugriff" on termine
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Angemeldete Nutzer: voller Zugriff" on umsatz
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Angemeldete Nutzer: voller Zugriff" on team
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Angemeldete Nutzer: voller Zugriff" on bewerber
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
