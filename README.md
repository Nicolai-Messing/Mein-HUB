# Mein Hub — Selbstständigkeit

Eine kleine Web-App für Termine, Umsatz (Neu/Bestand), Bewerberpipeline und
Organigramm. Läuft im Browser und auf dem Handy, mit echtem Login
(E-Mail + Passwort) für dich, deine Partnerin und Freunde.

Diese Anleitung geht davon aus, dass du **noch keine** Accounts bei GitHub,
Supabase oder Vercel hast. Alles ist kostenlos (Free-Tier reicht locker für
privaten Gebrauch).

---

## Schritt 1 — GitHub-Konto & Repository

1. Gehe zu **github.com** → "Sign up" → Konto anlegen (E-Mail, Passwort,
   Nutzername).
2. Oben rechts auf das **+** klicken → **"New repository"**.
3. Name z. B. `mein-hub`, auf **Private** stellen (nur du bestimmst, wer
   Zugriff hat), dann **"Create repository"**.
4. Lade den Inhalt dieses Projektordners in das Repository hoch:
   - Einfachste Variante ganz ohne Kommandozeile: Auf der GitHub-Repo-Seite
     auf **"uploading an existing file"** klicken, alle Dateien/Ordner aus
     diesem Projekt per Drag & Drop hochladen, unten "Commit changes"
     klicken.

## Schritt 2 — Supabase (Datenbank + Login)

1. Gehe zu **supabase.com** → "Start your project" → mit GitHub anmelden
   (Konto wird automatisch verknüpft).
2. **"New project"** → einen Namen vergeben (z. B. `mein-hub`), ein
   Datenbank-Passwort setzen (merken, brauchst du selten wieder), Region
   z. B. Frankfurt (eu-central-1) wählen → **"Create new project"**.
   Das Projekt braucht ca. 1–2 Minuten zum Einrichten.
3. Im linken Menü auf **"SQL Editor"** → **"New query"**.
4. Öffne die Datei `supabase/schema.sql` aus diesem Projekt, kopiere den
   kompletten Inhalt hinein und klicke **"Run"**. Das erstellt alle
   benötigten Tabellen und Zugriffsregeln.
5. Im linken Menü auf **"Authentication" → "Providers" → "Email"**.
   - Für den schnellsten Start: **"Confirm email"** ausschalten, damit sich
     neue Nutzer sofort ohne Bestätigungs-Mail anmelden können. (Für mehr
     Sicherheit kannst du das später wieder einschalten — dann bekommt jede
     neue Person eine Bestätigungs-Mail.)
6. Im linken Menü auf **"Project Settings" → "API"**. Dort findest du:
   - **Project URL** (sieht aus wie `https://xxxxx.supabase.co`)
   - **anon public key** (langer Text)
   Beide brauchst du im nächsten Schritt.

## Schritt 3 — Vercel (Hosting mit eigener URL)

1. Gehe zu **vercel.com** → "Sign Up" → mit GitHub anmelden.
2. **"Add New..." → "Project"**.
3. Wähle dein `mein-hub`-Repository aus GitHub aus → **"Import"**.
4. Bei **"Environment Variables"** trägst du zwei Variablen ein:
   - `NEXT_PUBLIC_SUPABASE_URL` → deine Project URL aus Schritt 2.6
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → deinen anon public key aus Schritt 2.6
5. Auf **"Deploy"** klicken. Nach ca. 1 Minute bekommst du eine Live-URL wie
   `mein-hub-xyz.vercel.app`.

Fertig — diese URL kannst du dir, deiner Partnerin und Freunden schicken.
Jede Person registriert sich einmal mit eigener E-Mail + Passwort über
"Registrieren" auf der Login-Seite.

---

## Wie Daten geteilt werden

Alle angemeldeten Nutzer sehen dieselben Termine, Umsätze, Team- und
Bewerberdaten — es ist bewusst ein **gemeinsamer** Arbeitsbereich für deinen
privaten/geschäftlichen Kreis, keine getrennten Konten pro Person.

## Eigene Domain (optional)

In Vercel unter **Project → Settings → Domains** kannst du später eine
eigene Domain (z. B. `hub.deinefirma.de`) hinterlegen, falls du eine hast.

## Lokal testen (optional, für technisch Interessierte)

```bash
npm install
cp .env.local.example .env.local   # dann die echten Werte eintragen
npm run dev
```
Die App läuft dann unter `http://localhost:3000`.

## Nächste Ausbaustufen

Dieses Projekt ist bewusst als erstes Modul gebaut. Zeiterfassung, private
Finanzen, Aufgaben & Ziele sowie freie Projekterstellung lassen sich als
weitere Tabellen + Tabs auf dieselbe Weise ergänzen.
