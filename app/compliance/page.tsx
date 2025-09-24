"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";

type Control =
  | "Policy Pack Loaded"
  | "PII & Sensitive Data Scan"
  | "Model Card Check"
  | "Prompt/Action Guardrails"
  | "Approval Checkpoint"
  | "Apply & Immutable Log";

type RiskLevel = "low" | "medium" | "high";

type Finding = {
  id: string;
  title: string;
  level: RiskLevel;
  detail: string;
  remediation: string;
};

const CONTROLS: Control[] = [
  "Policy Pack Loaded",
  "PII & Sensitive Data Scan",
  "Model Card Check",
  "Prompt/Action Guardrails",
  "Approval Checkpoint",
  "Apply & Immutable Log",
];

const SEED_FINDINGS: Finding[] = [
  {
    id: "C-101",
    title: "PII detected in customer chat snippet",
    level: "medium",
    detail:
      "Two email addresses and one phone number were found in the proposed training set.",
    remediation:
      "Mask emails and redact phone numbers using policy 'mask_pii_v2'. Re-run scan.",
  },
  {
    id: "C-202",
    title: "Model usage outside approved region",
    level: "low",
    detail:
      "Staging worker selected eu-west-2; allowed regions are us-east, us-south.",
    remediation: "Pin region to 'us-east' for all workers in this project.",
  },
  {
    id: "C-303",
    title: "Action exceeds role-based guardrail",
    level: "high",
    detail:
      "Agent attempted to increase daily budget by 40% (limit 25%) without approval token.",
    remediation:
      "Require human approval or reduce change within band. Record rationale.",
  },
];

const colors = {
  bg: "#ffffff",
  ink: "#111111",
  muted: "#6b7280",
  border: "#e5e7eb",
  card: "#ffffff",
  accent: "#1d4ed8",
  good: "#0a7f2e",
  warn: "#b45309",
  bad: "#b91c1c",
} as const;

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: colors.bg,
    color: colors.ink,
    minHeight: "100vh",
    fontFamily: 'Calibri, Arial, "Times New Roman", system-ui',
    lineHeight: 1.35,
  },
  wrap: { maxWidth: 1120, margin: "24px auto", padding: "0 16px" },
  h1: { fontSize: 22, margin: 0 },
  sub: { color: colors.muted, fontSize: 14, margin: "2px 0 16px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr 320px",
    gap: 16,
  } as React.CSSProperties,
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 16,
  },
  section: {
    fontSize: 13,
    letterSpacing: ".4px",
    color: "#374151",
    textTransform: "uppercase",
    margin: "0 0 12px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    fontSize: 12,
    textAlign: "left",
    padding: "6px 8px",
    borderBottom: `1px solid ${colors.border}`,
  },
  td: {
    fontSize: 12,
    textAlign: "left",
    padding: "6px 8px",
    borderBottom: `1px solid ${colors.border}`,
  },
  mono: {
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: 12,
    color: "#111",
    background: "#fff",
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: 8,
    whiteSpace: "pre-wrap",
    overflow: "auto",
  },
  kpis: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  } as React.CSSProperties,
  kpi: {
    padding: 10,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    background: "#f9fafb",
  },
  kpiLabel: { fontSize: 12, color: colors.muted },
  kpiValue: { fontSize: 18, marginTop: 2 },
};

function dot(level: RiskLevel): React.CSSProperties {
  const bg =
    level === "low" ? colors.good : level === "medium" ? colors.warn : colors.bad;
  return {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: bg,
    marginTop: 6,
    flex: "0 0 10px",
  };
}
function step(active: boolean, done: boolean): React.CSSProperties {
  return {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    padding: 10,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    background: done ? "#eef2ff" : "#f9fafb",
    marginBottom: 8,
    boxShadow: active ? "inset 0 0 0 2px #bfdbfe" : "none",
  };
}
function bullet(active: boolean, done: boolean): React.CSSProperties {
  return {
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginTop: 6,
    background: done ? colors.good : active ? colors.accent : "#d1d5db",
    flex: "0 0 10px",
  };
}
function btn(): React.CSSProperties {
  return {
    background: colors.accent,
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    outlineColor: "#93c5fd",
  };
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<Control | null>(null);
  const [approved, setApproved] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [findings, setFindings] = useState<Finding[]>(SEED_FINDINGS);

  // KPIs
  const [issuesFound, setIssuesFound] = useState(3);
  const [blockedActions, setBlockedActions] = useState(1);
  const [timeToApprove, setTimeToApprove] = useState("—");

  const receipt = useMemo(() => {
    if (!approved) return "{ pending }";
    return JSON.stringify(
      {
        run_id: "A9-COMPLY-001",
        approved: true,
        approver: "RiskOfficer@demo",
        policy_pack: {
          pii_masking: "mask_pii_v2",
          region_allowlist: ["us-east", "us-south"],
          budget_change_limit_pct: 25,
        },
        findings,
        decision: "Proceed with masked data; enforce region; require approval for >25% deltas.",
        rollback_token: "RBK-COMPLY-9f3c21",
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }, [approved, findings]);

  useEffect(() => {
    if (!started) return;
    let t: number | undefined;
    const seq = [...CONTROLS];
    let i = 0;

    const advance = () => {
      setActive(seq[i]);

      if (seq[i] === "PII & Sensitive Data Scan") {
        // simulate scan populating findings
        setFindings(SEED_FINDINGS);
        setIssuesFound(SEED_FINDINGS.length);
      }
      if (seq[i] === "Prompt/Action Guardrails") {
        setBlockedActions(1);
      }
      if (seq[i] === "Approval Checkpoint") {
        setCanApprove(true);
        setTimeToApprove("~45s");
      }

      i += 1;
      if (i < seq.length) t = window.setTimeout(advance, 900);
    };

    setActive("Policy Pack Loaded");
    t = window.setTimeout(advance, 800);
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [started]);

  function onStart() {
    setStarted(true);
    setApproved(false);
    setCanApprove(false);
    setIssuesFound(0);
    setBlockedActions(0);
    setTimeToApprove("—");
  }
  function onApprove() {
    setApproved(true);
    setCanApprove(false);
    setActive("Apply & Immutable Log");
  }

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.wrap}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <Image
            src="/aurora9-logo.jpg"
            alt="AURORA9 logo"
            width={200}
            height={48}
            priority
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <h1 style={styles.h1}>AURORA9 Compliance & Governance Demo</h1>
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            Seeded demo — no live APIs
          </span>
        </header>
        <p style={styles.sub}>
          Showcase how <strong>watsonx.governance</strong> concepts map to
          AURORA9: load policies, scan data, enforce guardrails, require human
          approval, then log an immutable receipt.
        </p>

        <div style={styles.grid}>
          {/* LEFT: Findings + Controls */}
          <section style={styles.card}>
            <h2 style={styles.section}>Findings (Seeded)</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Risk</th>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Detail</th>
                  <th style={styles.th}>Remediation</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f) => (
                  <tr key={f.id}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={dot(f.level)} />
                        <span style={{ textTransform: "capitalize" }}>{f.level}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{f.title}</td>
                    <td style={styles.td}>{f.detail}</td>
                    <td style={styles.td}>{f.remediation}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button onClick={onStart} disabled={started && !canApprove} style={btn()}>
                Start Compliance Run
              </button>
              <button onClick={onApprove} disabled={!canApprove} style={btn()}>
                Approve
              </button>
            </div>

            {/* Consistent inline nav */}
            <div style={{ marginTop: 10 }}>
              <InlineNav current="compliance" />
            </div>
          </section>

          {/* MIDDLE: Timeline + Receipt */}
          <section style={styles.card}>
            <h2 style={styles.section}>Control Timeline</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {CONTROLS.map((c) => {
                const isActive = active === c;
                const isDone = active ? CONTROLS.indexOf(c) < CONTROLS.indexOf(active) : false;
                return (
                  <li key={c} style={step(isActive, isDone)}>
                    <div style={bullet(isActive, isDone)} />
                    <div>
                      <strong>{c}</strong>
                      <div style={{ fontSize: 12, color: "#374151" }}>
                        {c === "Policy Pack Loaded" &&
                          "Load risk policies (PII masking, region, budget bands)."}
                        {c === "PII & Sensitive Data Scan" &&
                          "Scan proposed data/actions; classify and mask as needed."}
                        {c === "Model Card Check" &&
                          "Verify model + prompt against approved model cards."}
                        {c === "Prompt/Action Guardrails" &&
                          "Enforce role-based constraints and safe change bands."}
                        {c === "Approval Checkpoint" &&
                          "Human-in-the-loop validation for exceptions."}
                        {c === "Apply & Immutable Log" &&
                          "Apply remediated changes; write audit receipt + rollback token."}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <h2 style={styles.section}>Governance Receipt</h2>
            <pre style={styles.mono}>
              {approved ? receipt : started ? "{ awaiting approval }" : "{ pending }"}
            </pre>
          </section>

          {/* RIGHT: KPIs */}
          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={styles.kpis}>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Issues Found</div>
                <div style={styles.kpiValue}>{issuesFound}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Actions Blocked</div>
                <div style={styles.kpiValue}>{blockedActions}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Time to Approval</div>
                <div style={styles.kpiValue}>{timeToApprove}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Rollback Ready</div>
                <div style={styles.kpiValue}>Yes</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
