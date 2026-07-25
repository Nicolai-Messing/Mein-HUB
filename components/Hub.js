"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Calendar, Users, TrendingUp, Plus, Check, Trash2, LogOut,
  Building2, UserPlus, Euro, Briefcase,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ---------------------------------------------------------
   DESIGN TOKENS — "Kontor" (Business-Cockpit für Selbstständige)
   Teal = Neugeschäft/Wachstum · Gold = Bestand/Stabilität · Plum = Menschen/Team
--------------------------------------------------------- */
const C = {
  bg: "#0E1013", surface: "#171A1F", surface2: "#1F242B", border: "#2A2F37",
  ink: "#EDEFF2", inkMuted: "#8B92A0",
  gold: "#C9A227", goldSoft: "rgba(201,162,39,0.14)",
  teal: "#2FBF9F", tealSoft: "rgba(47,191,159,0.14)",
  plum: "#9A6FD1", plumSoft: "rgba(154,111,209,0.14)",
  red: "#E15B5B", redSoft: "rgba(225,91,91,0.14)",
};
const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const TERMIN_TYPES = [
  { key: "Erstgespräch", color: C.teal, soft: C.tealSoft },
  { key: "Kundentermin", color: C.gold, soft: C.goldSoft },
  { key: "Bewerbergespräch", color: C.plum, soft: C.plumSoft },
  { key: "Intern", color: C.inkMuted, soft: "rgba(139,146,160,0.14)" },
  { key: "Sonstiges", color: C.inkMuted, soft: "rgba(139,146,160,0.14)" },
];
const typeColor = (t) => TERMIN_TYPES.find((x) => x.key === t) || TERMIN_TYPES[4];
const STATUS_FLOW = ["Eingeladen", "Gespräch geführt", "Zusage", "Absage"];
const eur = (n) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n || 0);
const todayISO = () => new Date().toISOString().slice(0, 10);
const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const monthKey = (iso) => iso.slice(0, 7);
const monthLabel = (key) => { const [y, m] = key.split("-"); return `${MONTH_LABELS[parseInt(m, 10) - 1]} ${y.slice(2)}`; };

/* ---------------------------------------------------------
   UI BAUSTEINE
--------------------------------------------------------- */
function Chip({ color, soft, children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontFamily: FONT_BODY, fontWeight: 600, color, background: soft, whiteSpace: "nowrap" }}>{children}</span>;
}
function Card({ children, style }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, ...style }}>{children}</div>;
}
function SectionTitle({ icon: Icon, children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && <Icon size={18} color={C.inkMuted} />}
        <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>{children}</h2>
      </div>
      {action}
    </div>
  );
}
function Btn({ children, onClick, variant = "primary", icon: Icon, style, type = "button", disabled }) {
  const variants = {
    primary: { background: C.ink, color: C.bg, border: "none" },
    ghost: { background: "transparent", color: C.inkMuted, border: `1px solid ${C.border}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 9, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1, ...variants[variant], ...style }}>
      {Icon && <Icon size={14} />}{children}
    </button>
  );
}
const inputStyle = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 11px", color: C.ink, fontFamily: FONT_BODY, fontSize: 13, outline: "none", boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: C.inkMuted, fontFamily: FONT_BODY, fontWeight: 600, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.4 };
function Field({ label, children }) { return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div>; }
function Empty({ text }) { return <div style={{ padding: "28px 16px", textAlign: "center", color: C.inkMuted, fontFamily: FONT_BODY, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 10 }}>{text}</div>; }

/* ---------------------------------------------------------
   AUTH SCREEN (Supabase Auth: E-Mail + Passwort)
--------------------------------------------------------- */
function AuthScreen() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMsg(null);
    if (!email || !password) return;
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else setMsg("Fast geschafft — bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben. Danach kannst du dich anmelden.");
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: FONT_BODY, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.teal, letterSpacing: 2, marginBottom: 8 }}>MEIN HUB</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.ink, margin: 0, fontWeight: 600 }}>Selbstständigkeit</h1>
          <p style={{ color: C.inkMuted, fontSize: 13, marginTop: 8 }}>Termine, Umsatz, Team & Bewerber an einem Ort.</p>
        </div>
        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button onClick={() => setMode("login")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: mode === "login" ? C.surface2 : "transparent", color: mode === "login" ? C.ink : C.inkMuted, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Anmelden</button>
            <button onClick={() => setMode("signup")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${C.border}`, background: mode === "signup" ? C.surface2 : "transparent", color: mode === "signup" ? C.ink : C.inkMuted, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Registrieren</button>
          </div>
          <Field label="E-Mail"><input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></Field>
          <Field label="Passwort"><input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} /></Field>
          {msg && <div style={{ color: msg.includes("Fast geschafft") ? C.teal : C.red, fontSize: 12, marginBottom: 12 }}>{msg}</div>}
          <Btn variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit} disabled={busy}>
            {mode === "login" ? "Anmelden" : "Konto erstellen"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   LEDGER STRIP
--------------------------------------------------------- */
function LedgerStrip({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24, background: C.surface }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ flex: "1 1 150px", padding: "14px 18px", borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ fontSize: 10, color: C.inkMuted, fontFamily: FONT_BODY, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{it.label}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: it.color || C.ink, fontWeight: 500 }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   ÜBERSICHT
--------------------------------------------------------- */
function Uebersicht({ termine, umsatz, bewerber }) {
  const heute = todayISO();
  const offeneTermine = termine.filter((t) => !t.erledigt && t.datum >= heute).slice(0, 5);
  const thisMonth = monthKey(heute);
  const umsatzMonat = umsatz.filter((u) => monthKey(u.datum) === thisMonth);
  const neuMonat = umsatzMonat.filter((u) => u.art === "Neu").reduce((s, u) => s + Number(u.betrag), 0);
  const bestandMonat = umsatzMonat.filter((u) => u.art === "Bestand").reduce((s, u) => s + Number(u.betrag), 0);
  const bewerbungenOffen = bewerber.filter((b) => b.status === "Eingeladen" || b.status === "Gespräch geführt").length;
  const gesamt = umsatz.reduce((s, u) => s + Number(u.betrag), 0);

  const chartData = useMemo(() => {
    const map = {};
    umsatz.forEach((u) => { const k = monthKey(u.datum); if (!map[k]) map[k] = { monat: k, Neu: 0, Bestand: 0 }; map[k][u.art] += Number(u.betrag); });
    return Object.values(map).sort((a, b) => a.monat.localeCompare(b.monat)).slice(-6).map((d) => ({ ...d, label: monthLabel(d.monat) }));
  }, [umsatz]);

  return (
    <div>
      <LedgerStrip items={[
        { label: "Umsatz gesamt", value: eur(gesamt) },
        { label: "Neuumsatz (Monat)", value: eur(neuMonat), color: C.teal },
        { label: "Bestand (Monat)", value: eur(bestandMonat), color: C.gold },
        { label: "Bewerbungen offen", value: bewerbungenOffen, color: C.plum },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }} className="hub-grid-2">
        <Card>
          <SectionTitle icon={TrendingUp}>Umsatzverlauf</SectionTitle>
          {chartData.length === 0 ? <Empty text='Noch keine Umsätze erfasst. Trag im Tab „Umsatz" den ersten Eintrag ein.' /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 12 }} formatter={(v) => eur(v)} />
                  <Bar dataKey="Neu" stackId="a" fill={C.teal} />
                  <Bar dataKey="Bestand" stackId="a" fill={C.gold} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <SectionTitle icon={Calendar}>Nächste Termine</SectionTitle>
          {offeneTermine.length === 0 ? <Empty text="Keine anstehenden Termine." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {offeneTermine.map((t) => { const tc = typeColor(t.typ); return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ color: C.ink, fontSize: 13, fontWeight: 600 }}>{t.titel}</div>
                    <div style={{ color: C.inkMuted, fontSize: 12, fontFamily: FONT_MONO, marginTop: 2 }}>{t.datum}{t.zeit ? ` · ${t.zeit}` : ""}</div>
                  </div>
                  <Chip color={tc.color} soft={tc.soft}>{t.typ}</Chip>
                </div>
              ); })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TERMINE
--------------------------------------------------------- */
function Termine({ termine, reload, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Alle");
  const [form, setForm] = useState({ titel: "", typ: "Erstgespräch", person: "", datum: todayISO(), zeit: "", notiz: "" });

  const add = async () => {
    if (!form.titel.trim()) return;
    await supabase.from("termine").insert([{ ...form, erledigt: false, owner: userEmail }]);
    setForm({ titel: "", typ: "Erstgespräch", person: "", datum: todayISO(), zeit: "", notiz: "" });
    setShowForm(false);
    reload();
  };
  const toggle = async (t) => { await supabase.from("termine").update({ erledigt: !t.erledigt }).eq("id", t.id); reload(); };
  const remove = async (id) => { await supabase.from("termine").delete().eq("id", id); reload(); };

  const filtered = termine.filter((t) => filter === "Alle" || t.typ === filter).sort((a, b) => (a.datum + (a.zeit || "")).localeCompare(b.datum + (b.zeit || "")));
  const grouped = {};
  filtered.forEach((t) => { if (!grouped[t.datum]) grouped[t.datum] = []; grouped[t.datum].push(t); });

  return (
    <div>
      <SectionTitle icon={Calendar} action={<Btn icon={Plus} onClick={() => setShowForm(!showForm)}>{showForm ? "Abbrechen" : "Neuer Termin"}</Btn>}>Termine</SectionTitle>
      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }} className="hub-grid-2">
            <Field label="Titel"><input style={inputStyle} value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} placeholder="z. B. Erstgespräch Fr. Meyer" /></Field>
            <Field label="Typ"><select style={inputStyle} value={form.typ} onChange={(e) => setForm({ ...form, typ: e.target.value })}>{TERMIN_TYPES.map((t) => <option key={t.key}>{t.key}</option>)}</select></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="hub-grid-3">
            <Field label="Person / Kunde"><input style={inputStyle} value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} /></Field>
            <Field label="Datum"><input type="date" style={inputStyle} value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} /></Field>
            <Field label="Uhrzeit"><input type="time" style={inputStyle} value={form.zeit} onChange={(e) => setForm({ ...form, zeit: e.target.value })} /></Field>
          </div>
          <Field label="Notiz"><input style={inputStyle} value={form.notiz} onChange={(e) => setForm({ ...form, notiz: e.target.value })} /></Field>
          <Btn onClick={add}>Speichern</Btn>
        </Card>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {["Alle", ...TERMIN_TYPES.map((t) => t.key)].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 13px", borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: FONT_BODY, cursor: "pointer", border: `1px solid ${filter === f ? C.ink : C.border}`, background: filter === f ? C.ink : "transparent", color: filter === f ? C.bg : C.inkMuted }}>{f}</button>
        ))}
      </div>
      {Object.keys(grouped).length === 0 ? <Empty text="Keine Termine in dieser Ansicht. Leg oben einen neuen an." /> : (
        Object.keys(grouped).sort().map((datum) => (
          <div key={datum} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.inkMuted, marginBottom: 8 }}>
              {new Date(datum + "T00:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long" })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {grouped[datum].map((t) => { const tc = typeColor(t.typ); return (
                <Card key={t.id} style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, opacity: t.erledigt ? 0.5 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => toggle(t)} style={{ width: 20, height: 20, borderRadius: 6, border: `1px solid ${C.border}`, background: t.erledigt ? C.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      {t.erledigt && <Check size={13} color={C.bg} />}
                    </button>
                    <div>
                      <div style={{ color: C.ink, fontSize: 13, fontWeight: 600, textDecoration: t.erledigt ? "line-through" : "none" }}>{t.titel}</div>
                      <div style={{ color: C.inkMuted, fontSize: 12, fontFamily: FONT_MONO, marginTop: 2 }}>{t.zeit && `${t.zeit} · `}{t.person}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Chip color={tc.color} soft={tc.soft}>{t.typ}</Chip>
                    <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted }}><Trash2 size={14} /></button>
                  </div>
                </Card>
              ); })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   UMSATZ
--------------------------------------------------------- */
function Umsatz({ umsatz, reload, userEmail }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ datum: todayISO(), betrag: "", art: "Neu", kunde: "", notiz: "" });

  const add = async () => {
    const betrag = parseFloat(form.betrag.toString().replace(",", "."));
    if (!betrag || !form.kunde.trim()) return;
    await supabase.from("umsatz").insert([{ ...form, betrag, owner: userEmail }]);
    setForm({ datum: todayISO(), betrag: "", art: "Neu", kunde: "", notiz: "" });
    setShowForm(false);
    reload();
  };
  const remove = async (id) => { await supabase.from("umsatz").delete().eq("id", id); reload(); };

  const sorted = [...umsatz].sort((a, b) => b.datum.localeCompare(a.datum));
  const totalNeu = umsatz.filter((u) => u.art === "Neu").reduce((s, u) => s + Number(u.betrag), 0);
  const totalBestand = umsatz.filter((u) => u.art === "Bestand").reduce((s, u) => s + Number(u.betrag), 0);

  const chartData = useMemo(() => {
    const map = {};
    umsatz.forEach((u) => { const k = monthKey(u.datum); if (!map[k]) map[k] = { monat: k, Neu: 0, Bestand: 0 }; map[k][u.art] += Number(u.betrag); });
    return Object.values(map).sort((a, b) => a.monat.localeCompare(b.monat)).slice(-12).map((d) => ({ ...d, label: monthLabel(d.monat) }));
  }, [umsatz]);

  return (
    <div>
      <SectionTitle icon={Euro} action={<Btn icon={Plus} onClick={() => setShowForm(!showForm)}>{showForm ? "Abbrechen" : "Neuer Eintrag"}</Btn>}>Umsatz</SectionTitle>
      <LedgerStrip items={[
        { label: "Neuumsatz gesamt", value: eur(totalNeu), color: C.teal },
        { label: "Bestandsumsatz gesamt", value: eur(totalBestand), color: C.gold },
        { label: "Summe", value: eur(totalNeu + totalBestand) },
      ]} />
      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="hub-grid-3">
            <Field label="Datum"><input type="date" style={inputStyle} value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} /></Field>
            <Field label="Betrag (€)"><input style={inputStyle} value={form.betrag} onChange={(e) => setForm({ ...form, betrag: e.target.value })} placeholder="z. B. 1500" /></Field>
            <Field label="Art"><select style={inputStyle} value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })}><option>Neu</option><option>Bestand</option></select></Field>
          </div>
          <Field label="Kunde / Projekt"><input style={inputStyle} value={form.kunde} onChange={(e) => setForm({ ...form, kunde: e.target.value })} /></Field>
          <Field label="Notiz"><input style={inputStyle} value={form.notiz} onChange={(e) => setForm({ ...form, notiz: e.target.value })} /></Field>
          <Btn onClick={add}>Speichern</Btn>
        </Card>
      )}
      <Card style={{ marginBottom: 20 }}>
        {chartData.length === 0 ? <Empty text="Noch keine Umsätze erfasst." /> : (
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke={C.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 12 }} formatter={(v) => eur(v)} />
                <Bar dataKey="Neu" stackId="a" fill={C.teal} />
                <Bar dataKey="Bestand" stackId="a" fill={C.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
      {sorted.length === 0 ? <Empty text="Noch keine Einträge." /> : (
        <Card style={{ padding: 0, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_BODY }}>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Datum", "Kunde / Projekt", "Art", "Betrag", ""].map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>)}</tr></thead>
            <tbody>
              {sorted.map((u) => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 16px", fontFamily: FONT_MONO, fontSize: 12, color: C.inkMuted }}>{u.datum}</td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: C.ink }}>{u.kunde}</td>
                  <td style={{ padding: "10px 16px" }}><Chip color={u.art === "Neu" ? C.teal : C.gold} soft={u.art === "Neu" ? C.tealSoft : C.goldSoft}>{u.art}</Chip></td>
                  <td style={{ padding: "10px 16px", fontFamily: FONT_MONO, fontSize: 13, color: C.ink }}>{eur(u.betrag)}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}><button onClick={() => remove(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted }}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   TEAM & BEWERBER
--------------------------------------------------------- */
function OrgNode({ member, byManager, onRemove }) {
  const children = byManager[member.id] || [];
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", width: "fit-content" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.plumSoft, color: C.plum, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 13 }}>{member.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div style={{ color: C.ink, fontSize: 13, fontWeight: 600 }}>{member.name}</div>
          <div style={{ color: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }}>{member.rolle}</div>
        </div>
        <button onClick={() => onRemove(member.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted, marginLeft: 6 }}><Trash2 size={13} /></button>
      </div>
      {children.length > 0 && (
        <div style={{ marginLeft: 24, borderLeft: `1px solid ${C.border}`, paddingLeft: 20 }}>
          {children.map((c) => <OrgNode key={c.id} member={c} byManager={byManager} onRemove={onRemove} />)}
        </div>
      )}
    </div>
  );
}

function TeamUndBewerber({ team, bewerber, reload }) {
  const [teamForm, setTeamForm] = useState({ name: "", rolle: "", manager_id: "" });
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [bewForm, setBewForm] = useState({ name: "", rolle: "" });
  const [showBewForm, setShowBewForm] = useState(false);

  const addTeamMember = async () => {
    if (!teamForm.name.trim()) return;
    await supabase.from("team").insert([{ name: teamForm.name.trim(), rolle: teamForm.rolle.trim() || "Teammitglied", manager_id: teamForm.manager_id || null }]);
    setTeamForm({ name: "", rolle: "", manager_id: "" });
    setShowTeamForm(false);
    reload();
  };
  const removeMember = async (id) => { await supabase.from("team").delete().eq("id", id); reload(); };

  const addBewerber = async () => {
    if (!bewForm.name.trim()) return;
    await supabase.from("bewerber").insert([{ name: bewForm.name.trim(), rolle: bewForm.rolle.trim() || "—", status: "Eingeladen" }]);
    setBewForm({ name: "", rolle: "" });
    setShowBewForm(false);
    reload();
  };
  const setStatus = async (id, status) => { await supabase.from("bewerber").update({ status }).eq("id", id); reload(); };
  const removeBewerber = async (id) => { await supabase.from("bewerber").delete().eq("id", id); reload(); };
  const uebernehmen = async (b) => {
    await supabase.from("team").insert([{ name: b.name, rolle: b.rolle, manager_id: null }]);
    await supabase.from("bewerber").delete().eq("id", b.id);
    reload();
  };

  const byManager = {};
  team.forEach((m) => { const key = m.manager_id || "root"; if (!byManager[key]) byManager[key] = []; byManager[key].push(m); });
  const roots = byManager["root"] || [];

  return (
    <div>
      <SectionTitle icon={Users} action={<Btn icon={UserPlus} onClick={() => setShowBewForm(!showBewForm)}>{showBewForm ? "Abbrechen" : "Neue Bewerbung"}</Btn>}>Bewerberpipeline</SectionTitle>
      {showBewForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="hub-grid-2">
            <Field label="Name"><input style={inputStyle} value={bewForm.name} onChange={(e) => setBewForm({ ...bewForm, name: e.target.value })} /></Field>
            <Field label="Rolle"><input style={inputStyle} value={bewForm.rolle} onChange={(e) => setBewForm({ ...bewForm, rolle: e.target.value })} placeholder="z. B. Vertrieb" /></Field>
          </div>
          <Btn onClick={addBewerber}>Speichern</Btn>
        </Card>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }} className="hub-grid-4">
        {STATUS_FLOW.map((status) => (
          <div key={status}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>{status} · {bewerber.filter((b) => b.status === status).length}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
              {bewerber.filter((b) => b.status === status).map((b) => (
                <Card key={b.id} style={{ padding: 12 }}>
                  <div style={{ color: C.ink, fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                  <div style={{ color: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO, marginBottom: 8 }}>{b.rolle}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {status === "Eingeladen" && <button onClick={() => setStatus(b.id, "Gespräch geführt")} style={{ fontSize: 11, color: C.plum, background: C.plumSoft, border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>Gespräch geführt →</button>}
                    {status === "Gespräch geführt" && (<>
                      <button onClick={() => setStatus(b.id, "Zusage")} style={{ fontSize: 11, color: C.teal, background: C.tealSoft, border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>Zusage</button>
                      <button onClick={() => setStatus(b.id, "Absage")} style={{ fontSize: 11, color: C.red, background: C.redSoft, border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>Absage</button>
                    </>)}
                    {status === "Zusage" && <button onClick={() => uebernehmen(b)} style={{ fontSize: 11, color: C.bg, background: C.teal, border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontWeight: 700 }}>Ins Team übernehmen</button>}
                    <button onClick={() => removeBewerber(b.id)} style={{ fontSize: 11, color: C.inkMuted, background: "transparent", border: "none", cursor: "pointer", marginLeft: "auto" }}><Trash2 size={12} /></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SectionTitle icon={Building2} action={<Btn icon={Plus} onClick={() => setShowTeamForm(!showTeamForm)}>{showTeamForm ? "Abbrechen" : "Teammitglied hinzufügen"}</Btn>}>Organigramm</SectionTitle>
      {showTeamForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="hub-grid-3">
            <Field label="Name"><input style={inputStyle} value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></Field>
            <Field label="Rolle"><input style={inputStyle} value={teamForm.rolle} onChange={(e) => setTeamForm({ ...teamForm, rolle: e.target.value })} /></Field>
            <Field label="Vorgesetzte:r">
              <select style={inputStyle} value={teamForm.manager_id} onChange={(e) => setTeamForm({ ...teamForm, manager_id: e.target.value })}>
                <option value="">— Keiner (Top) —</option>
                {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </div>
          <Btn onClick={addTeamMember}>Speichern</Btn>
        </Card>
      )}
      <Card>
        {roots.length === 0 ? <Empty text="Noch kein Team angelegt. Füge oben das erste Mitglied hinzu." /> : roots.map((m) => <OrgNode key={m.id} member={m} byManager={byManager} onRemove={removeMember} />)}
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------
   APP SHELL
--------------------------------------------------------- */
const NAV = [
  { key: "uebersicht", label: "Übersicht", icon: TrendingUp },
  { key: "termine", label: "Termine", icon: Calendar },
  { key: "umsatz", label: "Umsatz", icon: Euro },
  { key: "team", label: "Team", icon: Briefcase },
];

export default function Hub() {
  const [session, setSession] = useState(undefined); // undefined = lädt, null = ausgeloggt
  const [tab, setTab] = useState("uebersicht");
  const [loading, setLoading] = useState(true);
  const [termine, setTermine] = useState([]);
  const [umsatz, setUmsatz] = useState([]);
  const [team, setTeam] = useState([]);
  const [bewerber, setBewerber] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const reload = async () => {
    setLoading(true);
    const [t, u, tm, b] = await Promise.all([
      supabase.from("termine").select("*").order("datum"),
      supabase.from("umsatz").select("*").order("datum"),
      supabase.from("team").select("*"),
      supabase.from("bewerber").select("*"),
    ]);
    setTermine(t.data || []);
    setUmsatz(u.data || []);
    setTeam(tm.data || []);
    setBewerber(b.data || []);
    setLoading(false);
  };

  useEffect(() => { if (session) reload(); }, [session]);

  const fontImport = `
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
    select, input { color-scheme: dark; }
    .hub-sidebar { display: flex; }
    .hub-bottomnav { display: none; }
    @media (max-width: 780px) {
      .hub-sidebar { display: none; }
      .hub-bottomnav { display: flex; }
      .hub-grid-2, .hub-grid-3, .hub-grid-4 { grid-template-columns: 1fr !important; }
      .hub-main-pad { padding: 16px !important; padding-bottom: 90px !important; }
    }
  `;

  if (session === undefined) {
    return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMuted, fontFamily: FONT_MONO }}>Lädt…</div>;
  }
  if (!session) {
    return <div style={{ fontFamily: FONT_BODY }}><style>{fontImport}</style><AuthScreen /></div>;
  }

  const userEmail = session.user.email;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: FONT_BODY }}>
      <style>{fontImport}</style>
      <aside className="hub-sidebar" style={{ flexDirection: "column", width: 220, borderRight: `1px solid ${C.border}`, padding: 20, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.teal, letterSpacing: 2 }}>MEIN HUB</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.ink, fontWeight: 600 }}>Selbstständigkeit</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: tab === n.key ? C.surface2 : "transparent", border: "none", cursor: "pointer", color: tab === n.key ? C.ink : C.inkMuted, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, textAlign: "left" }}>
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ color: C.inkMuted, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</span>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: C.inkMuted, cursor: "pointer", flexShrink: 0 }}><LogOut size={15} /></button>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="hub-main-pad" style={{ padding: "28px 32px" }}>
          {loading ? <div style={{ color: C.inkMuted, fontFamily: FONT_MONO, fontSize: 13 }}>Lädt…</div> : (<>
            {tab === "uebersicht" && <Uebersicht termine={termine} umsatz={umsatz} bewerber={bewerber} />}
            {tab === "termine" && <Termine termine={termine} reload={reload} userEmail={userEmail} />}
            {tab === "umsatz" && <Umsatz umsatz={umsatz} reload={reload} userEmail={userEmail} />}
            {tab === "team" && <TeamUndBewerber team={team} bewerber={bewerber} reload={reload} />}
          </>)}
        </div>
      </div>
      <nav className="hub-bottomnav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: `1px solid ${C.border}`, padding: "8px 6px", justifyContent: "space-around", zIndex: 10 }}>
        {NAV.map((n) => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: tab === n.key ? C.teal : C.inkMuted, fontSize: 10, fontFamily: FONT_BODY, fontWeight: 600, padding: "4px 10px" }}>
            <n.icon size={18} /> {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
