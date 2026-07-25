"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Calendar, Users, TrendingUp, Plus, Trash2, LogOut,
  Building2, UserPlus, Euro, Briefcase, Target, Percent, Settings2, User,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

/* ---------------------------------------------------------
   DESIGN TOKENS — Corporate Design
--------------------------------------------------------- */
const C = {
  bg: "#E7E2DF", surface: "#FFFFFF", surface2: "#EFEBE8", border: "#D9D3CE",
  ink: "#1F396A", inkMuted: "#8A8375",
  gold: "#DDAE36", goldSoft: "rgba(221,174,54,0.18)",
  teal: "#4C719C", tealSoft: "rgba(76,113,156,0.14)",
  plum: "#1F396A", plumSoft: "rgba(31,57,106,0.10)",
  red: "#B5534A", redSoft: "rgba(181,83,74,0.12)",
};
const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const eur = (n) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n || 0);
const num = (n) => new Intl.NumberFormat("de-DE").format(n || 0);
const todayISO = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => todayISO().slice(0, 7);
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const monthLabel = (key) => { const parts = key.split("-"); const y = parts[0]; const m = parts[1]; return MONTH_LABELS[parseInt(m, 10) - 1] + " " + y.slice(2); };

const PARTNER_STATUS = [
  { key: "Bewerber", bg: "#AFC8E3", text: "#1F396A" },
  { key: "PoPa", bg: "#1F396A", text: "#FFFFFF" },
  { key: "Aktiver Partner", bg: "#DDAE36", text: "#3A2E06" },
  { key: "Inaktiver Partner", bg: "#E0E0E0", text: "#6B6560" },
];
const statusStyle = (s) => PARTNER_STATUS.find((x) => x.key === s) || PARTNER_STATUS[0];

/* ---------------------------------------------------------
   UI BAUSTEINE
--------------------------------------------------------- */
function Chip({ color, soft, children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontFamily: FONT_BODY, fontWeight: 600, color: color, background: soft, whiteSpace: "nowrap" }}>{children}</span>;
}
function Card({ children, style }) {
  return <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(31,57,106,0.07)", ...style }}>{children}</div>;
}
function SectionTitle({ icon: Icon, children, action, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Icon && <Icon size={18} color={C.inkMuted} />}
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 20, color: C.ink, margin: 0 }}>{children}</h2>
        </div>
        {sub && <p style={{ color: C.inkMuted, fontSize: 12, margin: "4px 0 0 28px" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}
function Btn({ children, onClick, variant, icon: Icon, style, type, disabled }) {
  variant = variant || "primary";
  type = type || "button";
  const variants = {
    primary: { background: C.ink, color: "#FFFFFF", border: "none" },
    ghost: { background: "transparent", color: C.inkMuted, border: "1px solid " + C.border },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 9, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, ...variants[variant], ...style }}>
      {Icon && <Icon size={14} />}{children}
    </button>
  );
}
const inputStyle = { width: "100%", background: C.surface2, border: "1px solid " + C.border, borderRadius: 8, padding: "9px 11px", color: C.ink, fontFamily: FONT_BODY, fontSize: 13, outline: "none", boxSizing: "border-box" };
const labelStyle = { fontSize: 11, color: C.inkMuted, fontFamily: FONT_BODY, fontWeight: 600, marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: 0.4 };
function Field({ label, children }) { return <div style={{ marginBottom: 12 }}><label style={labelStyle}>{label}</label>{children}</div>; }
function Empty({ text }) { return <div style={{ padding: "28px 16px", textAlign: "center", color: C.inkMuted, fontFamily: FONT_BODY, fontSize: 13, border: "1px dashed " + C.border, borderRadius: 10 }}>{text}</div>; }
function MonthPicker({ value, onChange }) {
  return <input type="month" value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, width: "auto", fontFamily: FONT_MONO }} />;
}

/* ---------------------------------------------------------
   AUTH SCREEN
--------------------------------------------------------- */
function AuthScreen() {
  const [mode, setMode] = useState("login");
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
      else setMsg("Fast geschafft - bitte bestaetige deine E-Mail-Adresse ueber den Link, den wir dir geschickt haben. Danach kannst du dich anmelden.");
    }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: FONT_BODY, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.teal, letterSpacing: 2, marginBottom: 8 }}>MEIN HUB</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.ink, margin: 0, fontWeight: 600 }}>Selbststaendigkeit</h1>
          <p style={{ color: C.inkMuted, fontSize: 13, marginTop: 8 }}>Aktivitaet, Umsatz, Provision und Struktur an einem Ort.</p>
        </div>
        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button onClick={() => setMode("login")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid " + C.border, background: mode === "login" ? C.surface2 : "transparent", color: mode === "login" ? C.ink : C.inkMuted, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Anmelden</button>
            <button onClick={() => setMode("signup")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid " + C.border, background: mode === "signup" ? C.surface2 : "transparent", color: mode === "signup" ? C.ink : C.inkMuted, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Registrieren</button>
          </div>
          <Field label="E-Mail"><input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></Field>
          <Field label="Passwort"><input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} /></Field>
          {msg && <div style={{ color: msg.indexOf("Fast geschafft") === 0 ? C.teal : C.red, fontSize: 12, marginBottom: 12 }}>{msg}</div>}
          <Btn variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit} disabled={busy}>
            {mode === "login" ? "Anmelden" : "Konto erstellen"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   LEDGER STRIP + PROGRESS
--------------------------------------------------------- */
function LedgerStrip({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", border: "1px solid " + C.border, borderRadius: 12, overflow: "hidden", marginBottom: 24, background: C.surface }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ flex: "1 1 150px", padding: "14px 18px", borderLeft: i > 0 ? "1px solid " + C.border : "none" }}>
          <div style={{ fontSize: 10, color: C.inkMuted, fontFamily: FONT_BODY, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{it.label}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: it.color || C.ink, fontWeight: 500 }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}
function ProgressBar({ pct, color }) {
  color = color || C.teal;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ background: C.surface2, borderRadius: 999, height: 10, overflow: "hidden", border: "1px solid " + C.border }}>
      <div style={{ width: clamped + "%", height: "100%", background: color, transition: "width 0.3s ease" }} />
    </div>
  );
}

/* ---------------------------------------------------------
   PROVISIONS-LOGIK — basiert jetzt auf echtem Umsatz pro Person
--------------------------------------------------------- */
function computeProvision(team, rollen, umsatzPerson, monat) {
  const rollenById = {};
  rollen.forEach((r) => { rollenById[r.id] = r; });
  const rateOf = (m) => (m && m.rolle_id && rollenById[m.rolle_id] ? Number(rollenById[m.rolle_id].prozent) : 0);

  const byManager = {};
  team.forEach((m) => {
    const k = m.manager_id || "root";
    if (!byManager[k]) byManager[k] = [];
    byManager[k].push(m);
  });

  const revenueByMember = {};
  umsatzPerson.filter((u) => u.monat === monat).forEach((u) => {
    revenueByMember[u.team_member_id] = Number(u.neu || 0) + Number(u.bestand || 0);
  });
  const revenueOf = (id) => revenueByMember[id] || 0;

  const cache = {};
  function subtreeRevenue(id) {
    if (cache[id] !== undefined) return cache[id];
    const children = byManager[id] || [];
    const total = revenueOf(id) + children.reduce((s, c) => s + subtreeRevenue(c.id), 0);
    cache[id] = total;
    return total;
  }
  function nodeEarnings(id) {
    const node = team.find((m) => m.id === id);
    const rate = rateOf(node);
    const own = (rate / 100) * revenueOf(id);
    const children = byManager[id] || [];
    const overrides = children.reduce((s, c) => s + (Math.max(0, rate - rateOf(c)) / 100) * subtreeRevenue(c.id), 0);
    return own + overrides;
  }

  const self = team.find((m) => m.ist_ich);
  const selfRate = self ? rateOf(self) : 0;
  const directPartners = self ? (byManager[self.id] || []) : [];
  const breakdown = directPartners.map((p) => ({
    member: p,
    rate: rateOf(p),
    ownRevenue: revenueOf(p.id),
    subtreeRevenue: subtreeRevenue(p.id),
    override: (Math.max(0, selfRate - rateOf(p)) / 100) * subtreeRevenue(p.id),
  }));

  const gesamtumsatz = team.reduce((s, m) => s + revenueOf(m.id), 0);
  const meinVerdienst = self ? nodeEarnings(self.id) : 0;

  return { self, selfRate, gesamtumsatz, breakdown, meinVerdienst, subtreeRevenue, nodeEarnings, revenueOf, byManager, rollenById, rateOf };
}

/* ---------------------------------------------------------
   UEBERSICHT
--------------------------------------------------------- */
function Uebersicht({ umsatzPerson, umsatzMonat, team, rollen, aktivitaet }) {
  const monat = currentMonth();
  const ziel = (umsatzMonat.find((u) => u.monat === monat) || {}).ziel || 0;
  const prov = computeProvision(team, rollen, umsatzPerson, monat);
  const zielPct = ziel > 0 ? (prov.gesamtumsatz / ziel) * 100 : 0;

  const aktMonat = aktivitaet.filter((a) => a.monat === monat);
  const sum = (key) => aktMonat.reduce((s, a) => s + Number(a[key] || 0), 0);
  const egZiel = sum("erstgespraeche_ziel"); const egIst = sum("erstgespraeche_ist");
  const tZiel = sum("termine_ziel"); const tIst = sum("termine_ist");

  const chartData = useMemo(() => {
    const byMonth = {};
    umsatzPerson.forEach((u) => {
      if (!byMonth[u.monat]) byMonth[u.monat] = 0;
      byMonth[u.monat] += Number(u.neu || 0) + Number(u.bestand || 0);
    });
    return Object.keys(byMonth).sort().slice(-6).map((mk) => ({ label: monthLabel(mk), Umsatz: byMonth[mk] }));
  }, [umsatzPerson]);

  return (
    <div>
      <LedgerStrip items={[
        { label: "Umsatz IST (Monat)", value: eur(prov.gesamtumsatz) },
        { label: "Zielerreichung", value: zielPct.toFixed(0) + "%", color: zielPct >= 100 ? C.gold : C.teal },
        { label: "Mein Verdienst (Monat)", value: eur(prov.meinVerdienst), color: C.gold },
        { label: "Direkte Partner", value: prov.breakdown.length, color: C.plum },
      ]} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }} className="hub-grid-2">
        <Card>
          <SectionTitle icon={TrendingUp}>Umsatzverlauf</SectionTitle>
          {chartData.length === 0 ? <Empty text="Noch keine Umsaetze erfasst. Trag im Tab Umsatz die ersten Werte ein." /> : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke={C.border} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={{ stroke: C.border }} tickLine={false} />
                  <YAxis tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, fontFamily: FONT_BODY, fontSize: 12 }} formatter={(v) => eur(v)} />
                  <Bar dataKey="Umsatz" fill={C.teal} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <SectionTitle icon={Target}>Aktivitaet (Monat)</SectionTitle>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkMuted, marginBottom: 6 }}>
              <span>Erstgespraeche</span><span style={{ fontFamily: FONT_MONO }}>{num(egIst)} / {num(egZiel)}</span>
            </div>
            <ProgressBar pct={egZiel > 0 ? (egIst / egZiel) * 100 : 0} color={C.teal} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkMuted, marginBottom: 6 }}>
              <span>Termine</span><span style={{ fontFamily: FONT_MONO }}>{num(tIst)} / {num(tZiel)}</span>
            </div>
            <ProgressBar pct={tZiel > 0 ? (tIst / tZiel) * 100 : 0} color={C.gold} />
          </div>
          {!prov.self && <div style={{ marginTop: 16 }}><Empty text="Lege dich zunaechst im Tab Team selbst an." /></div>}
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   AKTIVITAET
--------------------------------------------------------- */
function AktivitaetRow({ member, monat, existing, reload }) {
  const [vals, setVals] = useState({
    erstgespraeche_ziel: (existing && existing.erstgespraeche_ziel) || 0,
    erstgespraeche_ist: (existing && existing.erstgespraeche_ist) || 0,
    termine_ziel: (existing && existing.termine_ziel) || 0,
    termine_ist: (existing && existing.termine_ist) || 0,
  });
  useEffect(() => {
    setVals({
      erstgespraeche_ziel: (existing && existing.erstgespraeche_ziel) || 0,
      erstgespraeche_ist: (existing && existing.erstgespraeche_ist) || 0,
      termine_ziel: (existing && existing.termine_ziel) || 0,
      termine_ist: (existing && existing.termine_ist) || 0,
    });
  }, [existing, monat]);

  const set = (k, v) => setVals((s) => ({ ...s, [k]: v === "" ? 0 : Number(v) }));
  const save = async () => {
    await supabase.from("aktivitaet").upsert([{ team_member_id: member.id, monat: monat, ...vals }], { onConflict: "team_member_id,monat" });
    reload();
  };
  const cell = { padding: "8px 10px", width: 90 };
  return (
    <tr style={{ borderBottom: "1px solid " + C.border, background: member.ist_ich ? C.plumSoft : "transparent" }}>
      <td style={{ padding: "8px 12px", fontSize: 13, color: C.ink, fontWeight: 600 }}>{member.name}{member.ist_ich ? " (Ich)" : ""}</td>
      {["erstgespraeche_ziel", "erstgespraeche_ist", "termine_ziel", "termine_ist"].map((k) => (
        <td key={k} style={cell}>
          <input type="number" min="0" style={{ ...inputStyle, textAlign: "center", fontFamily: FONT_MONO }} value={vals[k]} onChange={(e) => set(k, e.target.value)} onBlur={save} />
        </td>
      ))}
    </tr>
  );
}

function Aktivitaet({ team, aktivitaet, reload }) {
  const [monat, setMonat] = useState(currentMonth());
  const rows = aktivitaet.filter((a) => a.monat === monat);
  const byMember = {};
  rows.forEach((r) => { byMember[r.team_member_id] = r; });

  const chartData = team.map((m) => {
    const a = byMember[m.id] || {};
    return {
      name: m.name.split(" ")[0],
      "EG Ziel": Number(a.erstgespraeche_ziel || 0), "EG Ist": Number(a.erstgespraeche_ist || 0),
      "T Ziel": Number(a.termine_ziel || 0), "T Ist": Number(a.termine_ist || 0),
    };
  });

  return (
    <div>
      <SectionTitle icon={Target} sub="Nur Ziel und IST pro Monat - einzelne Termine trackst du in deinem separaten Tool." action={<MonthPicker value={monat} onChange={setMonat} />}>Aktivitaet</SectionTitle>

      {team.length === 0 ? <Empty text="Noch kein Team angelegt. Lege im Tab Team zuerst dich selbst und dann Partner an." /> : (
        <>
          <Card style={{ padding: 0, overflow: "auto", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_BODY }}>
              <thead>
                <tr style={{ borderBottom: "1px solid " + C.border }}>
                  <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, color: C.inkMuted, textTransform: "uppercase" }}>Teammitglied</th>
                  <th colSpan={2} style={{ textAlign: "center", padding: "10px 12px", fontSize: 11, color: C.teal, textTransform: "uppercase" }}>Erstgespraeche (Ziel / Ist)</th>
                  <th colSpan={2} style={{ textAlign: "center", padding: "10px 12px", fontSize: 11, color: C.gold, textTransform: "uppercase" }}>Termine (Ziel / Ist)</th>
                </tr>
              </thead>
              <tbody>
                {team.map((m) => <AktivitaetRow key={m.id} member={m} monat={monat} existing={byMember[m.id]} reload={reload} />)}
              </tbody>
            </table>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="hub-grid-2">
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Erstgespraeche - Ziel vs. Ist</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke={C.border} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: C.inkMuted, fontSize: 10, fontFamily: FONT_BODY }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="EG Ziel" fill={C.border} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="EG Ist" fill={C.teal} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Termine - Ziel vs. Ist</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke={C.border} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: C.inkMuted, fontSize: 10, fontFamily: FONT_BODY }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="T Ziel" fill={C.border} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="T Ist" fill={C.gold} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   UMSATZ — jetzt pro Person eintragbar
--------------------------------------------------------- */
function UmsatzRow({ member, monat, existing, reload }) {
  const [vals, setVals] = useState({ neu: (existing && existing.neu) || 0, bestand: (existing && existing.bestand) || 0 });
  useEffect(() => {
    setVals({ neu: (existing && existing.neu) || 0, bestand: (existing && existing.bestand) || 0 });
  }, [existing, monat]);
  const set = (k, v) => setVals((s) => ({ ...s, [k]: v === "" ? 0 : Number(v) }));
  const save = async () => {
    await supabase.from("umsatz_person").upsert([{ team_member_id: member.id, monat: monat, ...vals }], { onConflict: "team_member_id,monat" });
    reload();
  };
  return (
    <tr style={{ borderBottom: "1px solid " + C.border, background: member.ist_ich ? C.plumSoft : "transparent" }}>
      <td style={{ padding: "8px 12px", fontSize: 13, color: C.ink, fontWeight: 600 }}>{member.name}{member.ist_ich ? " (Ich)" : ""}</td>
      <td style={{ padding: "8px 10px", width: 130 }}><input type="number" min="0" style={{ ...inputStyle, textAlign: "right", fontFamily: FONT_MONO }} value={vals.neu} onChange={(e) => set("neu", e.target.value)} onBlur={save} /></td>
      <td style={{ padding: "8px 10px", width: 130 }}><input type="number" min="0" style={{ ...inputStyle, textAlign: "right", fontFamily: FONT_MONO }} value={vals.bestand} onChange={(e) => set("bestand", e.target.value)} onBlur={save} /></td>
      <td style={{ padding: "8px 12px", fontFamily: FONT_MONO, fontSize: 13, color: C.ink, textAlign: "right" }}>{eur(Number(vals.neu) + Number(vals.bestand))}</td>
    </tr>
  );
}

function Umsatz({ team, umsatzPerson, umsatzMonat, reload }) {
  const [monat, setMonat] = useState(currentMonth());
  const rows = umsatzPerson.filter((u) => u.monat === monat);
  const byMember = {};
  rows.forEach((r) => { byMember[r.team_member_id] = r; });

  const existingMonat = umsatzMonat.find((u) => u.monat === monat);
  const [zielForm, setZielForm] = useState({ ziel: 0, naechste_woche: 0 });
  useEffect(() => {
    setZielForm({ ziel: (existingMonat && existingMonat.ziel) || 0, naechste_woche: (existingMonat && existingMonat.naechste_woche) || 0 });
  }, [monat, existingMonat]);
  const saveZiel = async () => {
    await supabase.from("umsatz_monat").upsert([{ monat: monat, ziel: zielForm.ziel, naechste_woche: zielForm.naechste_woche }], { onConflict: "monat" });
    reload();
  };

  const gesamt = rows.reduce((s, r) => s + Number(r.neu || 0) + Number(r.bestand || 0), 0);
  const gesamtNeu = rows.reduce((s, r) => s + Number(r.neu || 0), 0);
  const gesamtBestand = rows.reduce((s, r) => s + Number(r.bestand || 0), 0);
  const zielPct = zielForm.ziel > 0 ? (gesamt / zielForm.ziel) * 100 : 0;

  const chartData = useMemo(() => {
    const byMonth = {};
    umsatzPerson.forEach((u) => {
      if (!byMonth[u.monat]) byMonth[u.monat] = { Neu: 0, Bestand: 0 };
      byMonth[u.monat].Neu += Number(u.neu || 0);
      byMonth[u.monat].Bestand += Number(u.bestand || 0);
    });
    return Object.keys(byMonth).sort().slice(-12).map((mk) => ({ label: monthLabel(mk), Neu: byMonth[mk].Neu, Bestand: byMonth[mk].Bestand }));
  }, [umsatzPerson]);

  return (
    <div>
      <SectionTitle icon={Euro} sub="Umsatz pro Person - dein Eigenumsatz und der jedes Partners getrennt." action={<MonthPicker value={monat} onChange={setMonat} />}>Umsatz</SectionTitle>

      {team.length === 0 ? <Empty text="Noch kein Team angelegt. Lege im Tab Team zuerst dich selbst an." /> : (
        <Card style={{ padding: 0, overflow: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT_BODY }}>
            <thead>
              <tr style={{ borderBottom: "1px solid " + C.border }}>
                <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, color: C.inkMuted, textTransform: "uppercase" }}>Person</th>
                <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, color: C.teal, textTransform: "uppercase" }}>Neu (Eur)</th>
                <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, color: C.gold, textTransform: "uppercase" }}>Bestand (Eur)</th>
                <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, color: C.inkMuted, textTransform: "uppercase" }}>Summe</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => <UmsatzRow key={m.id} member={m} monat={monat} existing={byMember[m.id]} reload={reload} />)}
            </tbody>
          </table>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="hub-grid-2">
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>{monthLabel(monat)} - Zielwerte</div>
          <Field label="Umsatzziel gesamt (Eur)"><input type="number" style={inputStyle} value={zielForm.ziel} onChange={(e) => setZielForm({ ...zielForm, ziel: Number(e.target.value) || 0 })} onBlur={saveZiel} /></Field>
          <Field label="Umsatz naechste Woche - Prognose (Eur)"><input type="number" style={inputStyle} value={zielForm.naechste_woche} onChange={(e) => setZielForm({ ...zielForm, naechste_woche: Number(e.target.value) || 0 })} onBlur={saveZiel} /></Field>
          <Btn onClick={saveZiel}>Speichern</Btn>
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Zielerreichung {monthLabel(monat)}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 30, color: zielPct >= 100 ? C.gold : C.teal, marginBottom: 6 }}>{zielPct.toFixed(0)}%</div>
          <div style={{ marginBottom: 16 }}><ProgressBar pct={zielPct} color={zielPct >= 100 ? C.gold : C.teal} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.inkMuted }}>Ziel</span><span style={{ fontFamily: FONT_MONO }}>{eur(zielForm.ziel)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.teal }}>IST Neu</span><span style={{ fontFamily: FONT_MONO }}>{eur(gesamtNeu)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.gold }}>IST Bestand</span><span style={{ fontFamily: FONT_MONO }}>{eur(gesamtBestand)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid " + C.border, paddingTop: 8, fontWeight: 700 }}><span style={{ color: C.ink }}>Summe IST</span><span style={{ fontFamily: FONT_MONO, color: C.ink }}>{eur(gesamt)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: C.inkMuted }}>Prognose naechste Woche</span><span style={{ fontFamily: FONT_MONO }}>{eur(zielForm.naechste_woche)}</span></div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Verlauf (12 Monate)</div>
        {chartData.length === 0 ? <Empty text="Noch keine Monatsdaten erfasst." /> : (
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke={C.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.inkMuted, fontSize: 11, fontFamily: FONT_MONO }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12 }} formatter={(v) => eur(v)} />
                <Bar dataKey="Neu" stackId="a" fill={C.teal} />
                <Bar dataKey="Bestand" stackId="a" fill={C.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------
   TEAM — Selbst-Setup, Rollen, Provisionsrechner, Organigramm
--------------------------------------------------------- */
function SelbstSetup({ rollen, reload }) {
  const [form, setForm] = useState({ name: "", rolle_id: "" });
  const save = async () => {
    if (!form.name.trim()) return;
    await supabase.from("team").insert([{ name: form.name.trim(), rolle_id: form.rolle_id || null, manager_id: null, status: "Aktiver Partner", ist_ich: true }]);
    reload();
  };
  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionTitle icon={User} sub="Du bist der Ausgangspunkt der Struktur. Leg dich einmal an, dann kannst du deinen eigenen Umsatz und deine Rolle wie bei jedem Partner pflegen.">Dich selbst anlegen</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="hub-grid-2">
        <Field label="Dein Name"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></Field>
        <Field label="Deine Rolle">
          <select style={inputStyle} value={form.rolle_id} onChange={(e) => setForm({ ...form, rolle_id: e.target.value })}>
            <option value="">- Keine -</option>
            {[...rollen].sort((a, b) => a.prozent - b.prozent).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.prozent}%)</option>)}
          </select>
        </Field>
      </div>
      <Btn onClick={save}>Anlegen</Btn>
    </Card>
  );
}

function RollenVerwaltung({ rollen, reload }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", prozent: "" });

  const add = async () => {
    if (!form.name.trim() || form.prozent === "") return;
    await supabase.from("rollen").insert([{ name: form.name.trim(), prozent: Number(form.prozent), sortierung: rollen.length }]);
    setForm({ name: "", prozent: "" });
    setShowForm(false);
    reload();
  };
  const updateField = async (id, field, value) => { await supabase.from("rollen").update({ [field]: value }).eq("id", id); reload(); };
  const remove = async (id) => { await supabase.from("rollen").delete().eq("id", id); reload(); };

  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionTitle icon={Settings2} sub="Umsatzbeteiligung je Rolle - frei anpassbar. Jede Stufe verdient die Differenz zur naechsttieferen Stufe in ihrer Linie." action={<Btn variant="ghost" icon={Plus} onClick={() => setShowForm(!showForm)}>{showForm ? "Abbrechen" : "Rolle hinzufuegen"}</Btn>}>
        Rollen und Provisionsstufen
      </SectionTitle>
      {showForm && (
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, flex: 2 }} placeholder="Rollenname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={{ ...inputStyle, flex: 1 }} placeholder="%" type="number" step="0.1" value={form.prozent} onChange={(e) => setForm({ ...form, prozent: e.target.value })} />
          <Btn onClick={add}>Speichern</Btn>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[...rollen].sort((a, b) => Number(a.prozent) - Number(b.prozent)).map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 8 }}>
            <input style={{ ...inputStyle, flex: 2 }} defaultValue={r.name} onBlur={(e) => e.target.value !== r.name && updateField(r.id, "name", e.target.value)} />
            <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
              <input style={{ ...inputStyle, textAlign: "right" }} type="number" step="0.1" defaultValue={r.prozent} onBlur={(e) => Number(e.target.value) !== Number(r.prozent) && updateField(r.id, "prozent", Number(e.target.value))} />
              <Percent size={13} color={C.inkMuted} />
            </div>
            <button onClick={() => remove(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Provisionsrechner({ team, rollen, umsatzPerson }) {
  const [monat, setMonat] = useState(currentMonth());
  const prov = useMemo(() => computeProvision(team, rollen, umsatzPerson, monat), [team, rollen, umsatzPerson, monat]);

  return (
    <Card style={{ marginBottom: 20 }}>
      <SectionTitle icon={Percent} sub="Berechnet aus dem tatsaechlich eingetragenen Umsatz jeder Person - keine Schaetzung." action={<MonthPicker value={monat} onChange={setMonat} />}>
        Provisionsrechner
      </SectionTitle>
      {!prov.self ? <Empty text="Lege dich zuerst selbst an, um den Provisionsrechner zu nutzen." /> : (
        <>
          <LedgerStrip items={[
            { label: "Gesamtumsatz Struktur", value: eur(prov.gesamtumsatz) },
            { label: "Deine Rolle", value: prov.selfRate + "%" },
            { label: "Dein Eigenumsatz", value: eur(prov.revenueOf(prov.self.id)) },
            { label: "Mein Verdienst", value: eur(prov.meinVerdienst), color: C.gold },
          ]} />
          {prov.breakdown.length === 0 ? <Empty text="Noch keine direkten Partner in der Struktur." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {prov.breakdown.map((b) => (
                <div key={b.member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: C.surface2, fontSize: 13, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ color: C.ink, fontWeight: 600 }}>{b.member.name}</span>
                  <span style={{ color: C.inkMuted, fontFamily: FONT_MONO, fontSize: 12 }}>Eigenumsatz {eur(b.ownRevenue)} - Struktur {eur(b.subtreeRevenue)}</span>
                  <span style={{ color: C.gold, fontFamily: FONT_MONO, fontWeight: 600 }}>+ {eur(b.override)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function PartnerCard({ member, prov, onRemove, small }) {
  const st = statusStyle(member.status);
  const rollenById = prov.rollenById;
  const rolleName = member.rolle_id && rollenById[member.rolle_id] ? rollenById[member.rolle_id].name : "-";
  const earnings = prov.nodeEarnings(member.id);
  return (
    <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 10, padding: small ? "8px 10px" : "10px 14px", display: "flex", alignItems: "center", gap: 10, width: small ? "100%" : "fit-content", boxShadow: "0 1px 2px rgba(31,57,106,0.05)" }}>
      <div style={{ width: small ? 24 : 30, height: small ? 24 : 30, borderRadius: 8, background: st.bg, color: st.text, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: small ? 11 : 13, flexShrink: 0 }}>
        {member.name.slice(0, 1).toUpperCase()}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: C.ink, fontSize: small ? 12 : 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</div>
        <div style={{ color: C.inkMuted, fontSize: 10, fontFamily: FONT_MONO }}>{rolleName}</div>
        {!small && <div style={{ color: C.gold, fontSize: 11, fontFamily: FONT_MONO, marginTop: 2 }}>{eur(earnings)}/Monat</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <Chip color={st.text} soft={st.bg}>{member.status}</Chip>
        <button onClick={() => onRemove(member.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkMuted }}><Trash2 size={12} /></button>
      </div>
    </div>
  );
}
function SelfCard({ member, prov }) {
  const rollenById = prov.rollenById;
  const rolleName = member.rolle_id && rollenById[member.rolle_id] ? rollenById[member.rolle_id].name : "-";
  const earnings = prov.meinVerdienst;
  return (
    <div style={{ background: C.ink, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, width: "fit-content", margin: "0 auto 16px" }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: C.gold, color: "#3A2E06", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_MONO, fontWeight: 700, fontSize: 15 }}>
        {member.name.slice(0, 1).toUpperCase()}
      </div>
      <div>
        <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>{member.name} (Ich)</div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: FONT_MONO }}>{rolleName}</div>
      </div>
      <div style={{ color: C.gold, fontSize: 13, fontFamily: FONT_MONO, fontWeight: 600, marginLeft: 8 }}>{eur(earnings)}/Monat</div>
    </div>
  );
}
function EmptySlot({ onClick, small }) {
  return (
    <button onClick={onClick} style={{ border: "1.5px dashed " + C.border, borderRadius: 10, padding: small ? "8px 10px" : "14px", background: "transparent", color: C.inkMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: FONT_BODY, fontSize: small ? 11 : 12, width: "100%", minHeight: small ? 40 : 58 }}>
      <Plus size={small ? 12 : 14} /> Freier Platz
    </button>
  );
}
function padSlots(list, n) {
  const out = list.slice();
  while (out.length < n) out.push(null);
  return out;
}

function TeamOrganigramm({ prov, openAdd, removeMember }) {
  const byManager = prov.byManager;
  const self = prov.self;
  const directPartners = byManager[self.id] || [];

  return (
    <div>
      <SelfCard member={self} prov={prov} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {padSlots(directPartners, 6).map((slot, i) => (
          <Card key={slot ? slot.id : "empty-root-" + i} style={{ padding: 14 }}>
            {!slot ? <EmptySlot onClick={() => openAdd(self.id)} /> : (
              <>
                <PartnerCard member={slot} prov={prov} onRemove={removeMember} />
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed " + C.border, display: "flex", flexDirection: "column", gap: 8 }}>
                  {padSlots(byManager[slot.id] || [], 6).map((s2, j) => (
                    s2 ? (
                      <div key={s2.id}>
                        <PartnerCard member={s2} prov={prov} onRemove={removeMember} small />
                        {(byManager[s2.id] || []).length > 0 && (
                          <div style={{ fontSize: 10, color: C.inkMuted, marginLeft: 34, marginTop: 2 }}>+{byManager[s2.id].length} weitere darunter</div>
                        )}
                      </div>
                    ) : <EmptySlot key={"e2-" + j} onClick={() => openAdd(slot.id)} small />
                  ))}
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function TeamTab({ team, rollen, umsatzPerson, reload }) {
  const self = team.find((m) => m.ist_ich);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", rolle_id: "", manager_id: "", status: "Bewerber" });

  const openAdd = (managerId) => { setTeamForm({ name: "", rolle_id: "", manager_id: managerId || "", status: "Bewerber" }); setShowTeamForm(true); };
  const addTeamMember = async () => {
    if (!teamForm.name.trim()) return;
    await supabase.from("team").insert([{ name: teamForm.name.trim(), rolle_id: teamForm.rolle_id || null, manager_id: teamForm.manager_id || null, status: teamForm.status }]);
    setShowTeamForm(false);
    reload();
  };
  const removeMember = async (id) => { await supabase.from("team").delete().eq("id", id); reload(); };

  const prov = useMemo(() => computeProvision(team, rollen, umsatzPerson, currentMonth()), [team, rollen, umsatzPerson]);

  if (!self) {
    return (
      <div>
        <SelbstSetup rollen={rollen} reload={reload} />
        {rollen.length === 0 && <Empty text="Es sind noch keine Rollen vorhanden. Lade das Migrationsskript, um die Standardrollen anzulegen." />}
      </div>
    );
  }

  return (
    <div>
      <Provisionsrechner team={team} rollen={rollen} umsatzPerson={umsatzPerson} />
      <RollenVerwaltung rollen={rollen} reload={reload} />

      <SectionTitle icon={Building2} sub="Zielstruktur: 6 direkte Partner, je 6 weitere darunter. Freie Plaetze fuellen sich nach und nach." action={<Btn icon={UserPlus} onClick={() => openAdd(self.id)}>Partner hinzufuegen</Btn>}>
        Organigramm
      </SectionTitle>

      {showTeamForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="hub-grid-2">
            <Field label="Name"><input style={inputStyle} value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} autoFocus /></Field>
            <Field label="Rolle">
              <select style={inputStyle} value={teamForm.rolle_id} onChange={(e) => setTeamForm({ ...teamForm, rolle_id: e.target.value })}>
                <option value="">- Keine -</option>
                {[...rollen].sort((a, b) => a.prozent - b.prozent).map((r) => <option key={r.id} value={r.id}>{r.name} ({r.prozent}%)</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="hub-grid-2">
            <Field label="Status">
              <select style={inputStyle} value={teamForm.status} onChange={(e) => setTeamForm({ ...teamForm, status: e.target.value })}>
                {PARTNER_STATUS.map((s) => <option key={s.key} value={s.key}>{s.key}</option>)}
              </select>
            </Field>
            <Field label="Direkt unter">
              <select style={inputStyle} value={teamForm.manager_id} onChange={(e) => setTeamForm({ ...teamForm, manager_id: e.target.value })}>
                <option value={self.id}>{self.name} (Ich)</option>
                {team.filter((m) => !m.ist_ich).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={addTeamMember}>Speichern</Btn>
            <Btn variant="ghost" onClick={() => setShowTeamForm(false)}>Abbrechen</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        {PARTNER_STATUS.map((s) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.inkMuted }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: s.bg, display: "inline-block", border: "1px solid " + C.border }} /> {s.key}
          </div>
        ))}
      </div>

      <TeamOrganigramm prov={prov} openAdd={openAdd} removeMember={removeMember} />
    </div>
  );
}

/* ---------------------------------------------------------
   APP SHELL
--------------------------------------------------------- */
const NAV = [
  { key: "uebersicht", label: "Uebersicht", icon: TrendingUp },
  { key: "aktivitaet", label: "Aktivitaet", icon: Target },
  { key: "umsatz", label: "Umsatz", icon: Euro },
  { key: "team", label: "Team", icon: Briefcase },
];

export default function Hub() {
  const [session, setSession] = useState(undefined);
  const [tab, setTab] = useState("uebersicht");
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [rollen, setRollen] = useState([]);
  const [aktivitaet, setAktivitaet] = useState([]);
  const [umsatzPerson, setUmsatzPerson] = useState([]);
  const [umsatzMonat, setUmsatzMonat] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const sub = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const reload = async () => {
    setLoading(true);
    const results = await Promise.all([
      supabase.from("team").select("*"),
      supabase.from("rollen").select("*"),
      supabase.from("aktivitaet").select("*"),
      supabase.from("umsatz_person").select("*"),
      supabase.from("umsatz_monat").select("*"),
    ]);
    setTeam(results[0].data || []);
    setRollen(results[1].data || []);
    setAktivitaet(results[2].data || []);
    setUmsatzPerson(results[3].data || []);
    setUmsatzMonat(results[4].data || []);
    setLoading(false);
  };

  useEffect(() => { if (session) reload(); }, [session]);

  const globalCss = "* { box-sizing: border-box; } ::-webkit-scrollbar { width: 8px; height: 8px; } ::-webkit-scrollbar-thumb { background: " + C.border + "; border-radius: 4px; } select, input { color-scheme: light; } .hub-sidebar { display: flex; } .hub-bottomnav { display: none; } @media (max-width: 780px) { .hub-sidebar { display: none; } .hub-bottomnav { display: flex; } .hub-grid-2, .hub-grid-3, .hub-grid-4 { grid-template-columns: 1fr !important; } .hub-main-pad { padding: 16px !important; padding-bottom: 90px !important; } }";

  if (session === undefined) return <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMuted, fontFamily: FONT_MONO }}>Laedt...</div>;
  if (!session) return <div style={{ fontFamily: FONT_BODY }}><style>{globalCss}</style><AuthScreen /></div>;

  const userEmail = session.user.email;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: FONT_BODY }}>
      <style>{globalCss}</style>
      <aside className="hub-sidebar" style={{ flexDirection: "column", width: 220, borderRight: "1px solid " + C.border, padding: 20, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.teal, letterSpacing: 2 }}>MEIN HUB</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.ink, fontWeight: 600 }}>Selbststaendigkeit</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: tab === n.key ? C.surface2 : "transparent", border: "none", cursor: "pointer", color: tab === n.key ? C.ink : C.inkMuted, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, textAlign: "left" }}>
              <n.icon size={16} /> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid " + C.border, paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ color: C.inkMuted, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</span>
          <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: C.inkMuted, cursor: "pointer", flexShrink: 0 }}><LogOut size={15} /></button>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="hub-main-pad" style={{ padding: "28px 32px" }}>
          {loading ? <div style={{ color: C.inkMuted, fontFamily: FONT_MONO, fontSize: 13 }}>Laedt...</div> : (
            <React.Fragment>
              {tab === "uebersicht" && <Uebersicht umsatzPerson={umsatzPerson} umsatzMonat={umsatzMonat} team={team} rollen={rollen} aktivitaet={aktivitaet} />}
              {tab === "aktivitaet" && <Aktivitaet team={team} aktivitaet={aktivitaet} reload={reload} />}
              {tab === "umsatz" && <Umsatz team={team} umsatzPerson={umsatzPerson} umsatzMonat={umsatzMonat} reload={reload} />}
              {tab === "team" && <TeamTab team={team} rollen={rollen} umsatzPerson={umsatzPerson} reload={reload} />}
            </React.Fragment>
          )}
        </div>
      </div>
      <nav className="hub-bottomnav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: "1px solid " + C.border, padding: "8px 6px", justifyContent: "space-around", zIndex: 10 }}>
        {NAV.map((n) => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: tab === n.key ? C.teal : C.inkMuted, fontSize: 10, fontFamily: FONT_BODY, fontWeight: 600, padding: "4px 10px" }}>
            <n.icon size={18} /> {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
