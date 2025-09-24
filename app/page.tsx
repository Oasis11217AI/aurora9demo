"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "./components/Nav";
import InlineNav from "./components/InlineNav";

type Change = { id: string; scope: string; rationale: string; before: string; after: string; };

const PROPOSED: Change[] = [
  { id: "A-01", scope: "Campaign A / Daily Budget", rationale: "Under-spend vs target TACoS floor; reallocate $20 from Campaign B.", before: "$80", after: "$100" },
  { id: "A-02", scope: "Campaign B / Negative Keyword", rationale: "High spend, zero orders over 14 days for query 'cheap fast charger'.", before: "—", after: "Add negative exact: 'cheap fast charger'" },
  { id: "A-03", scope: "Account / Schedule", rationale: "Shift +10% spend to 6–10pm window based on historical ROAS lift.", before: "Even pacing", after: "Even pacing +10% 6–10pm" },
];

const STEPS = ["Plan", "Pull Signals", "Propose", "Approval", "Apply & Log"] as const;
type Step = (typeof STEPS)[number];

const colors = { bg: "#fff", ink: "#111", muted: "#6b7280", border: "#e5e7eb", card: "#fff", accent: "#1d4ed8" } as const;

const styles: Record<string, React.CSSProperties> = {
  page: { background: colors.bg, color: colors.ink, minHeight: "100vh", fontFamily: 'Calibri, Arial, "Times New Roman", system-ui', lineHeight: 1.35 },
  wrap: { maxWidth: 1120, margin: "24px auto", padding: "0 16px" },
  h1: { fontSize: 22, margin: 0 },
  sub: { color: colors.muted, fontSize: 14, margin: "2px 0 16px" },
  grid: { display: "grid", gridTemplateColumns: "360px 1fr 320px", gap: 16 } as React.CSSProperties,
  card: { background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 },
  section: { fontSize: 13, letterSpacing: ".4px", color: "#374151", textTransform: "uppercase", margin: "0 0 12px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontSize: 12, textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${colors.border}` },
  td: { fontSize: 12, textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${colors.border}` },
  timeline: { listStyle: "none", margin: 0, padding: 0 },
  mono: { fontFamily: 'Consolas, "Courier New", monospace', fontSize: 12, color: "#111", background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 8, padding: 8, whiteSpace: "pre-wrap", overflow: "auto" },
  kpis: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } as React.CSSProperties,
  kpi: { padding: 10, border: `1px solid ${colors.border}`, borderRadius: 10, background: "#f9fafb" },
  kpiLabel: { fontSize: 12, color: colors.muted },
  kpiValue: { fontSize: 18, marginTop: 2 },
  link: { fontSize: 12, textDecoration: "none", color: colors.accent },
};

function btn(): React.CSSProperties { return { background: colors.accent, color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 600, outlineColor: "#93c5fd" }; }
function step(active: boolean, done: boolean): React.CSSProperties { return { display: "flex", gap: 8, alignItems: "flex-start", padding: 10, border: `1px solid ${colors.border}`, borderRadius: 10, background: done ? "#eef2ff" : "#f9fafb", marginBottom: 8, boxShadow: active ? "inset 0 0 0 2px #bfdbfe" : "none" }; }
function bullet(active: boolean, done: boolean): React.CSSProperties { return { width: 10, height: 10, borderRadius: "50%", marginTop: 6, background: done ? "#0a7f2e" : active ? colors.accent : "#d1d5db", flex: "0 0 10px" }; }

export default function Page() {
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<Step | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);

  const receipt = useMemo(() => {
    if (!approved) return "{ pending }";
    return JSON.stringify({ run_id: "A9-ADS-GOV-001", approved: true, approver: "MarketingLead@demo", change_set: PROPOSED, policy_pack: { tacos_floor: 0.08, daily_budget_cap: 250, negative_match_allowed: true }, rollback_token: "RBK-ADS-1a2b3c", timestamp: new Date().toISOString() }, null, 2);
  }, [approved]);

  useEffect(() => {
    if (!started) return;
    let t: number | undefined; const seq: Step[] = [...STEPS]; let i = 0;
    const advance = () => { setActive(seq[i]); if (seq[i] === "Approval") setCanApprove(true); i += 1; if (i < seq.length) t = window.setTimeout(advance, 900); };
    setActive("Plan"); t = window.setTimeout(advance, 800);
    return () => { if (t) window.clearTimeout(t); };
  }, [started]);

  function onStart() { setStarted(true); setApproved(false); setCanApprove(false); setActive(null); }
  function onApprove() { setApproved(true); setCanApprove(false); setActive("Apply & Log"); }

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.wrap}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Image src="/aurora9-logo.jpg" alt="AURORA9 logo" width={200} height={48} priority style={{ height: 36, width: "auto", objectFit: "contain" }} />
          <h1 style={styles.h1}>AURORA9 Ads Governance & Human Approval</h1>
          <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb" }}>Seeded demo — no live APIs</span>
        </header>
        <p style={styles.sub}>Agent proposes safe changes; you approve; actions are logged with a governance receipt. For PPC math see <Link href="/ads" style={styles.link}>/ads</Link>.</p>

        <div style={styles.grid}>
          <section style={styles.card}>
            <h2 style={styles.section}>Proposed Changes</h2>
            <table style={styles.table}><thead><tr><th style={styles.th}>Scope</th><th style={styles.th}>Rationale</th><th style={styles.th}>Before</th><th style={styles.th}>After</th></tr></thead>
              <tbody>{PROPOSED.map(c => (<tr key={c.id}><td style={styles.td}>{c.scope}</td><td style={styles.td}>{c.rationale}</td><td style={styles.td}>{c.before}</td><td style={styles.td}>{c.after}</td></tr>))}</tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={onStart} disabled={started && !canApprove} style={btn()}>Start Demo</button>
              <button onClick={onApprove} disabled={!canApprove} style={btn()}>Approve Changes</button>
            </div>

            {/* Inline nav in consistent order */}
            <div style={{ marginTop: 10 }}>
              <InlineNav current="governance" />
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.section}>Agent Timeline</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {STEPS.map(s => { const isActive = active === s; const isDone = active ? STEPS.indexOf(s) < STEPS.indexOf(active) : false;
                return (<li key={s} style={step(isActive, isDone)}><div style={bullet(isActive, isDone)} /><div><strong>{s}</strong><div style={{ fontSize: 12, color: "#374151" }}>
                  {s === "Plan" && "Objective & guardrails (TACoS floor, caps)."}
                  {s === "Pull Signals" && "Fetch last-30d performance (seeded)."}
                  {s === "Propose" && "Generate safe actions with reasons."}
                  {s === "Approval" && "Human-in-the-loop checkpoint."}
                  {s === "Apply & Log" && "Write + Governance Receipt + rollback token."}
                </div></div></li>); })}
            </ul>
            <h2 style={styles.section}>Governance Receipt</h2>
            <pre style={styles.mono}>{approved ? receipt : started ? "{ awaiting approval }" : "{ pending }"}</pre>
          </section>

          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={styles.kpis}>
              <div style={styles.kpi}><div style={styles.kpiLabel}>Proposals</div><div style={styles.kpiValue}>{PROPOSED.length}</div></div>
              <div style={styles.kpi}><div style={styles.kpiLabel}>Negatives Added</div><div style={styles.kpiValue}>1</div></div>
              <div style={styles.kpi}><div style={styles.kpiLabel}>Budget Shifts</div><div style={styles.kpiValue}>1</div></div>
              <div style={styles.kpi}><div style={styles.kpiLabel}>Rollback Ready</div><div style={styles.kpiValue}>Yes</div></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
