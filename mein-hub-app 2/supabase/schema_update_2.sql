-- Mein Hub — Migration 2: Aktivität, Umsatzziele, Rollen & Provision, Organigramm-Status
-- In Supabase unter "SQL Editor" -> "New query" einfügen und ausführen.
-- Baut auf dem ursprünglichen schema.sql auf (dort bereits ausgeführt vorausgesetzt).

-- 1) Rollen & Provisionsstufen -------------------------------------------------
create table if not exists rollen (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prozent numeric not null,
  ist_oberhaupt boolean not null default false,
  sortierung int not null default 0
);

insert into rollen (name, prozent, sortierung) values
  ('Trainee', 0.8, 1),
  ('Junior Consultant', 1.2, 2),
  ('Senior Consultant', 1.7, 3),
  ('Chief Consultant', 2.2, 4),
  ('Branch Manager', 2.7, 5),
  ('Regionalmanager', 3.1, 6),
  ('Divisional Manager', 3.3, 7),
  ('Generalmanager', 3.5, 8);

insert into rollen (name, prozent, ist_oberhaupt, sortierung) values ('Oberhaupt', 4.0, true, 9);

alter table rollen enable row level security;
create policy "Angemeldete Nutzer: voller Zugriff" on rollen
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 2) Team-Tabelle erweitern (Rolle + Status) -----------------------------------
alter table team add column if not exists rolle_id uuid references rollen(id);
alter table team add column if not exists status text not null default 'Bewerber';

-- 3) Aktivität: monatliches Ziel/IST je Teammitglied ---------------------------
create table if not exists aktivitaet (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references team(id) on delete cascade,
  monat text not null,
  erstgespraeche_ziel int not null default 0,
  erstgespraeche_ist int not null default 0,
  termine_ziel int not null default 0,
  termine_ist int not null default 0,
  unique (team_member_id, monat)
);
alter table aktivitaet enable row level security;
create policy "Angemeldete Nutzer: voller Zugriff" on aktivitaet
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 4) Umsatz pro Monat (ersetzt einzelne Umsatz-Einträge) -----------------------
create table if not exists umsatz_monat (
  id uuid primary key default gen_random_uuid(),
  monat text not null unique,
  ziel numeric not null default 0,
  ist_neu numeric not null default 0,
  ist_bestand numeric not null default 0,
  naechste_woche numeric not null default 0
);
alter table umsatz_monat enable row level security;
create policy "Angemeldete Nutzer: voller Zugriff" on umsatz_monat
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Hinweis: Die alten Tabellen "umsatz" und "bewerber" werden von der neuen
-- Oberfläche nicht mehr verwendet. Du kannst sie behalten (z. B. für alte
-- Daten) oder optional löschen mit:
--   drop table if exists umsatz;
--   drop table if exists bewerber;
