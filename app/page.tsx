"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Nav from "./components/Nav";
import InlineNav from "./components/InlineNav";
import DetailsPanel from "./components/DetailsPanel";
import { HOWTO_GOVERNANCE } from "./components/HowTo";
// Optional: only render comparison if you explicitly turn this on.
import ComparisonDetails from "./components/ComparisonDetails";
const SHOW_COMPARISON = false;

/** ----- TIMELINE STEPS (original order) ----- */
type StepId = "Plan" | "Pull Signals" | "Propose" | "Approval" | "Apply & Log";
const STEPS: StepId[] = ["Plan", "Pull Signals", "Propose", "Approval", "Apply & Log"];

/** ----- Inline styles to match original layout ----- */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    color: "#111",
    fontFamily: 'Calibri, Arial, "Times New Roman", system-ui',
  },
  wrap: { maxWidth: 1120, margin: "24px auto", padding: "0 16px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 16 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
  h2: { margin: 0, fontSize: 22 },
  badge: {
    fontSize: 11,
    border: "1px solid #e5e7eb",
    padding: "2px 6px",
    borderRadius: 8,
    background: "#f9fafb",
    color: "#374151",
  },
  section: { fontSize: 13, letterSpacing: ".3px", color: "#374151", textTransform: "uppercase", margin: "0 0 12px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: 12 },
  td: { padding: "6px 8px", borderBottom: "1px solid #e5e7eb", fontSize: 12, verticalAlign: "top" },
  btn: {
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default function Page() {
  // --- State (scoped to Governance only) ---
  const [active, setActive] = useState<StepId | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);
  const [receipt, setReceipt] = useState<unknown>("{ pending }");

  // Keep a stable timer ref so reset works reliably
  const timerRef = useRef<number | null>(null);

  // --- Proposal table (original demo data) ---
  const proposals = [
    {
      scope: "Campaign A / Daily Budget",
      rationale: "Under target TACoS vs. Campaign B; shift $20",
      before: "$80",
      after: "$100",
    },
    {
      scope: "Campaign B / Keyword",
      rationale: "High clicks, zero orders; add negative",
      before: "—",
      after: "NEG: exact 'cheap fast charger'",
    },
    {
      scope: "Campaign A / Pacing",
      rationale: "6–10pm ROAS historically higher; +10% window",
      before: "Even",
      after: "+10% 6–10pm",
    },
  ];

  // --- KPIs (match original UI; rollback updates after approval) ---
  const kpis = [
    { label: "Proposals", value: "3" },
    { label: "Negatives Added", value: "1" },
    { label: "Rollback Ready", value: approved ? "Yes" : "—" },
  ];

  // --- Helpers ---
  const clearTimers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const runSequence = () => {
    clearTimers();
    let i = 0;

    const tick = () => {
      const step = STEPS[i];
      setActive(step);
      if (step === "Approval") setCanApprove(true);
      i += 1;
      if (i < STEPS.length) {
        timerRef.current = window.setTimeout(tick, 900);
      }
    };

    setActive("Plan");
    timerRef.current = window.setTimeout(tick, 900);
  };

  // --- Button handlers (only affect governance) ---
  const handleStart = () => {
    setApproved(false);
    setCanApprove(false);
    setReceipt("{ awaiting approval }");
    runSequence();
  };

  const handleApprove = () => {
    if (!canApprove) return;
    setApproved(true);
    setCanApprove(false);
    setActive("Apply & Log");
    setReceipt({
      run_id: "A9-GOV-001",
      approved: true,
      approver: "AdsLead@demo",
      policy_pack: { budget_band: "+25%", regions: ["us-east", "us-south"], pii_policy: "mask_pii_v2" },
      change_set: [
        { type: "budget_shift", from: "Campaign B", to: "Campaign A", amount: 20, rationale: "Shift to higher ROAS" },
        { type: "negative", campaign: "Campaign B", keyword: "cheap fast charger", match: "exact" },
      ],
      rollback_token: "RBK-GOV-19ss",
      timestamp: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    clearTimers();
    setActive(null);
    setCanApprove(false);
    setApproved(false);
    setReceipt("{ pending }");
  };

  return (
    <div style={styles.page}>
      <Nav />

      {/* Optional comparison section above Governance; disabled by default to avoid layout issues */}
      {SHOW_COMPARISON && (
        <div style={styles.wrap}>
          <ComparisonDetails />
        </div>
      )}

      <div style={styles.wrap}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Image
            src="/aurora9-logo.jpg"
            alt="AURORA9 logo"
            width={200}
            height={48}
            priority
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <h1 style={styles.h2}>AURORA9 Ads Governance & Human Approval</h1>
          <span style={styles.badge}>Seeded demo — no live APIs</span>
        </header>

        {/* 3-column layout */}
        <div style={styles.grid}>
          {/* LEFT: Proposed Changes */}
          <section style={styles.card}>
            <h3 style={styles.section}>Proposed Changes</h3>
            <p style={{ margin: "8px 0 12px", color: "#374151" }}>
              The agent proposes safe changes. You approve them. Every apply creates an auditable receipt with a rollback token.
            </p>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Scope</th>
                  <th style={styles.th}>Rationale</th>
                  <th style={styles.th}>Before</th>
                  <th style={styles.th}>After</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{p.scope}</td>
                    <td style={styles.td}>{p.rationale}</td>
                    <td style={styles.td}>{p.before}</td>
                    <td style={styles.td}>{p.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button type="button" onClick={handleStart} style={styles.btn}>
                Start Demo
              </button>
              <button type="button" onClick={handleApprove} disabled={!canApprove} style={styles.btn}>
                Approve Changes
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              <InlineNav current="governance" />
            </div>
          </section>

          {/* MIDDLE: Timeline + Receipt + How it works */}
          <section style={styles.card}>
            <h3 style={styles.section}>Agent Timeline</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {STEPS.map((s) => (
                <li
                  key={s}
                  style={{
                    padding: 10,
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    background: "#f9fafb",
                    marginBottom: 8,
                    boxShadow: active === s ? "inset 0 0 0 2px #bfdbfe" : "none",
                  }}
                >
                  <strong>{s}</strong>
                </li>
              ))}
            </ul>

            <DetailsPanel
              heading="Governance Receipt"
              detailsText={approved ? "Receipt created. Use the technical toggle for full payload." : "{ pending }"}
              techData={receipt}
              fileBase="aurora9-governance-receipt"
              onReset={handleReset}
              variant="receipt"
            />

            <DetailsPanel
              heading="How it works"
              detailsText={HOWTO_GOVERNANCE}
              fileBase="aurora9-governance-howto"
            />
          </section>

          {/* RIGHT: KPIs */}
          <section style={styles.card}>
            <h3 style={styles.section}>KPIs</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {kpis.map((k) => (
                <div
                  key={k.label}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    background: "#f9fafb",
                    padding: 10,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{k.label}</div>
                  <div style={{ fontSize: 18 }}>{k.value}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
