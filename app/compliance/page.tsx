"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";
import DetailsPanel from "../components/DetailsPanel";

/** Types */
type StepId =
  | "Policy Pack Loaded"
  | "PII & Sensitive Data Scan"
  | "Model Card Check"
  | "Prompt/Action Guardrails"
  | "Approval Checkpoint"
  | "Apply & Immutable Log";

type Finding = {
  risk: "Low" | "Medium" | "High";
  title: string;
  detail: string;
  remediation: string;
};

type Totals = {
  issuesFound: number;
  actionsBlocked: number;
  timeToApprovalMin: number;
  rollbackReady: boolean;
};

/** Seeded Data */
const STEPS: StepId[] = [
  "Policy Pack Loaded",
  "PII & Sensitive Data Scan",
  "Model Card Check",
  "Prompt/Action Guardrails",
  "Approval Checkpoint",
  "Apply & Immutable Log",
];

const FINDINGS: Finding[] = [
  {
    risk: "Medium",
    title: "PII detected in customer chat snippet",
    detail:
      "Two email addresses and one phone number were found in the proposed training set.",
    remediation:
      "Mask emails and redact phone numbers using policy 'mask_pii_v2'. Re-run scan.",
  },
  {
    risk: "Low",
    title: "Model usage outside approved region",
    detail:
      "Staging worker selected 'us-west-2'; allowed regions are 'us-east', 'us-south'.",
    remediation: "Pin region to 'us-east' for all workers in this project.",
  },
  {
    risk: "High",
    title: "Action exceeds role-based guardrail",
    detail:
      "Agent attempted to increase daily budget by 40% (limit 25%) without approval token.",
    remediation:
      "Require human approval or reduce change within band. Record rationale.",
  },
];

function beforeTotals(): Totals {
  return { issuesFound: 3, actionsBlocked: 1, timeToApprovalMin: 12, rollbackReady: true };
}

function afterTotals(b: Totals): Totals {
  return {
    issuesFound: b.issuesFound,
    actionsBlocked: b.actionsBlocked,
    timeToApprovalMin: Math.max(1, b.timeToApprovalMin - 8), // demo: 12 -> 4 min
    rollbackReady: true,
  };
}

export default function Page() {
  /** Flow */
  const [active, setActive] = useState<StepId | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);

  /** Panels */
  const [detailsCleared, setDetailsCleared] = useState(true);
  const [receipt, setReceipt] = useState<unknown>("{ pending }");

  /** KPIs */
  const [afterMode, setAfterMode] = useState(false);
  const totalsBefore = useMemo(beforeTotals, []);
  const totalsAfter = useMemo(() => afterTotals(totalsBefore), [totalsBefore]);
  const totals = afterMode ? totalsAfter : totalsBefore;

  /** Findings text + CSV */
  const findingsText = FINDINGS.map((f) => {
    const bullet = f.risk === "High" ? "*" : f.risk === "Medium" ? "-" : ".";
    return `${bullet} [${f.risk}] ${f.title}
Detail: ${f.detail}
Remediation: ${f.remediation}`;
  }).join("\n\n");

  const findingsCsv = FINDINGS.map((f) => ({
    risk: f.risk,
    title: f.title,
    detail: f.detail,
    remediation: f.remediation,
  }));

  /** How it works text (ASCII only) */
  const howText = [
    "#1 Goal",
    "Wrap LLM/agent actions with enterprise controls: load policy -> scan -> enforce guardrails -> human approval -> immutable log.",
    "",
    "#2 Columns",
    "Left: Seeded findings and actions.",
    "Middle: Control Timeline + Findings/Remediation + Receipt.",
    "Right: KPIs (Before vs After).",
    "",
    "#3 Buttons",
    "Start Compliance Run: plays the control checks.",
    "Approve: permits exception(s), writes the receipt, flips KPIs to After.",
    "Reset: clears timeline and panels, returns KPIs to Before.",
    "",
    "#4 Controls (demo)",
    "PII Scan, Model Card check, Prompt/Action guardrails, Human checkpoint.",
    "",
    "#5 Receipt",
    "Immutable-style payload with findings, before/after KPIs, control list, rollback token, timestamp.",
  ].join("\n");

  /** Timeline animation */
  let timerRef: number | undefined;
  const clearTimers = () => {
    if (timerRef) {
      clearTimeout(timerRef);
      timerRef = undefined;
    }
  };
  const startSequence = () => {
    let i = 0;
    const tick = () => {
      const s = STEPS[i];
      setActive(s);
      if (s === "Approval Checkpoint") setCanApprove(true);
      i += 1;
      if (i < STEPS.length) timerRef = window.setTimeout(tick, 900);
    };
    setActive("Policy Pack Loaded");
    timerRef = window.setTimeout(tick, 900);
  };

  /** Actions */
  const onStart = () => {
    clearTimers();
    setApproved(false);
    setCanApprove(false);
    setAfterMode(false);
    setDetailsCleared(false);
    setReceipt("{ awaiting approval }");
    startSequence();
  };

  const onApprove = () => {
    if (!canApprove) return;
    setApproved(true);
    setCanApprove(false);
    setActive("Apply & Immutable Log");
    setAfterMode(true);

    setReceipt({
      run_id: "A9-COMPLY-001",
      approved: true,
      findings: FINDINGS,
      kpis_before: totalsBefore,
      kpis_after: totalsAfter,
      controls: STEPS,
      rollback_token: "RBK-COMP-xx31",
      timestamp: new Date().toISOString(),
    });
  };

  const onResetAll = () => {
    clearTimers();
    setActive(null);
    setApproved(false);
    setCanApprove(false);
    setAfterMode(false);
    setDetailsCleared(true);
    setReceipt("{ pending }");
  };

  /** Styles */
  const styles: Record<string, React.CSSProperties> = {
    page: { background: "#fff", color: "#111", minHeight: "100vh", fontFamily: 'Calibri, Arial, "Times New Roman", system-ui' },
    wrap: { maxWidth: 1120, margin: "24px auto", padding: "0 16px" },
    grid: { display: "grid", gridTemplateColumns: "360px 1fr 320px", gap: 16 },
    card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
    section: { fontSize: 13, letterSpacing: ".3px", color: "#374151", textTransform: "uppercase", margin: "0 0 12px" },
    th: { fontSize: 12, textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" },
    td: { fontSize: 12, padding: "6px 8px", borderBottom: "1px solid #e5e7eb" },
    btn: { background: "#1d4ed8", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
    subtle: { fontSize: 12, color: "#6b7280" },
    badge: { fontSize: 11, padding: "2px 8px", borderRadius: 9999, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", display: "inline-block", marginBottom: 8 },
    kpiCard: { border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 },
  };
  const item = (on: boolean): React.CSSProperties => ({
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    marginBottom: 8,
    boxShadow: on ? "inset 0 0 0 2px #bfdbfe" : "none",
  });

  /** Render */
  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.wrap}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Image
            src="/aurora9-logo.jpg"
            alt="AURORA9 logo"
            width={200}
            height={48}
            priority
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <h1 style={{ fontSize: 22, margin: 0 }}>AURORA9 Compliance Demo</h1>
          <span style={{ fontSize: 11, padding: "2px 6px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb", color: "#374151" }}>
            Seeded demo - no live APIs
          </span>
        </header>

        <p style={styles.subtle}>
          Showcase how watsonx.governance concepts map to AURORA9: load policies, scan data, enforce guardrails, require human approval, then log an immutable receipt.
        </p>

        <div style={styles.grid}>
          {/* LEFT: Findings */}
          <section style={styles.card}>
            <h2 style={styles.section}>Findings (Seeded)</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Risk", "Title", "Detail", "Remediation"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FINDINGS.map((f) => (
                  <tr key={f.title}>
                    <td style={styles.td}>{f.risk}</td>
                    <td style={styles.td}>{f.title}</td>
                    <td style={styles.td}>{f.detail}</td>
                    <td style={styles.td}>{f.remediation}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button type="button" onClick={onStart} style={styles.btn}>Start Compliance Run</button>
              <button type="button" onClick={onApprove} disabled={!canApprove} style={styles.btn}>Approve</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <InlineNav current="compliance" />
            </div>
          </section>

          {/* MIDDLE: Timeline + Panels */}
          <section style={styles.card}>
            <h2 style={styles.section}>Control Timeline</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {STEPS.map((s) => (
                <li key={s} style={item(active === s)}>
                  <strong>{s}</strong>
                </li>
              ))}
            </ul>

            <DetailsPanel
              heading="Findings & Remediation"
              detailsText={detailsCleared ? "{ pending }" : findingsText}
              techData={detailsCleared ? "{ pending }" : { findings: FINDINGS }}
              csvRows={detailsCleared ? undefined : findingsCsv}
              fileBase="aurora9-compliance-findings"
              onReset={onResetAll}
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset Findings</button>
            </div>

            <DetailsPanel
              heading="Governance Receipt"
              detailsText={approved ? "Receipt created. Use the technical toggle for full payload." : "{ pending }"}
              techData={receipt}
              fileBase="aurora9-compliance-receipt"
              onReset={onResetAll}
              variant="receipt"
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset Receipt</button>
            </div>

            <DetailsPanel
              heading="How it works"
              detailsText={howText}
              fileBase="aurora9-compliance-howto"
            />
          </section>

          {/* RIGHT: KPIs */}
          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={styles.badge}>{afterMode ? "After (simulated)" : "Before"}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={styles.kpiCard}>
                <div style={styles.subtle}>Issues Found</div>
                <div style={{ fontSize: 18 }}>{totals.issuesFound}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.subtle}>Actions Blocked</div>
                <div style={{ fontSize: 18 }}>{totals.actionsBlocked}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.subtle}>Time to Approval</div>
                <div style={{ fontSize: 18 }}>
                  {totals.timeToApprovalMin}
                  <span style={{ fontSize: 13, color: "#6b7280" }}> min</span>
                </div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.subtle}>Rollback Ready</div>
                <div style={{ fontSize: 18 }}>{totals.rollbackReady ? "Yes" : "No"}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
