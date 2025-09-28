"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";
import DetailsPanel from "../components/DetailsPanel";

/** ───────────────────────────────── Types ───────────────────────────────── */
type StepId =
  | "Plan"
  | "Pull Signals"
  | "Optimize"
  | "Constraints"
  | "Decision"
  | "Approval"
  | "Apply & Log";

type Sku = {
  sku: string;
  name: string;
  cost: number;
  current: number;
  map: number;
  competitor: number;
  demand: "elastic" | "neutral" | "inelastic";
};

type PriceProposal = {
  sku: string;
  before: number;
  after: number;
  rationale: string;
};

type Totals = {
  avgMarginPct: number;      // 0..1
  buyBoxDeltaAvg: number;    // average $ delta vs competitor
};

/** ─────────────────────────────── Seeded Data ───────────────────────────── */
const STEPS: StepId[] = [
  "Plan",
  "Pull Signals",
  "Optimize",
  "Constraints",
  "Decision",
  "Approval",
  "Apply & Log",
];

const SKUS: Sku[] = [
  { sku: "SKU-A", name: "20W USB-C Wall Charger",  cost: 5.20, current: 12.99, map: 11.99, competitor: 12.49, demand: "elastic"   },
  { sku: "SKU-B", name: "2-Pack USB-C to USB-C Cables", cost: 2.10, current: 8.99,  map: 7.49,  competitor: 9.49,  demand: "neutral"   },
  { sku: "SKU-C", name: "MagSafe Wireless Charger",    cost: 9.40, current: 21.99, map: 19.99, competitor: 22.99, demand: "inelastic" },
];

/** ─────────────────────────────── Utilities ─────────────────────────────── */
const moneyFmt = (n: number) => "$" + n.toFixed(2);
const pctFmt = (n: number) => (n * 100).toFixed(1) + "%";

/** margin % across rows for a given price selector */
function avgMarginPct(rows: Sku[], price: (s: Sku) => number) {
  const margin = rows.reduce((a, r) => a + Math.max(0, price(r) - r.cost), 0);
  const revenue = rows.reduce((a, r) => a + price(r), 0);
  return revenue > 0 ? margin / revenue : 0;
}

/** average delta vs competitor for a given price selector */
function buyBoxDeltaAvg(rows: Sku[], price: (s: Sku) => number) {
  const total = rows.reduce((a, r) => a + (price(r) - r.competitor), 0);
  return total / rows.length;
}

function beforeTotals(rows: Sku[]): Totals {
  return {
    avgMarginPct: avgMarginPct(rows, (s) => s.current),
    buyBoxDeltaAvg: buyBoxDeltaAvg(rows, (s) => s.current),
  };
}

/** simple demo heuristic (MAP floor, round .99, small nudges by elasticity) */
function optimizePrice(s: Sku): number {
  let p = s.current;
  if (s.demand === "elastic")   p = Math.max(s.map, s.current - 0.50);
  if (s.demand === "neutral")   p = Math.max(s.map, s.current - 0.20);
  if (s.demand === "inelastic") p = Math.min(s.current + 0.50, s.competitor + 1.00);
  p = Math.round(p) - 0.01; // .99 style
  return Math.max(s.map, Number(p.toFixed(2)));
}

function proposePrices(rows: Sku[]): PriceProposal[] {
  return rows.map((s) => {
    const after = optimizePrice(s);
    const rationale =
      s.demand === "elastic"
        ? "Elastic demand: nudge below competitor within MAP."
        : s.demand === "neutral"
        ? "Neutral demand: small down adjustment to improve conversion."
        : "Inelastic demand: small up adjustment while holding share.";
    return { sku: s.sku, before: s.current, after, rationale };
  });
}

function afterTotals(rows: Sku[]): Totals {
  const proposals = proposePrices(rows);
  const mapAfter = new Map<string, number>(proposals.map((p) => [p.sku, p.after]));
  return {
    avgMarginPct: avgMarginPct(rows, (s) => mapAfter.get(s.sku) ?? s.current),
    buyBoxDeltaAvg: buyBoxDeltaAvg(rows, (s) => mapAfter.get(s.sku) ?? s.current),
  };
}

/** ─────────────────────────────── Page ─────────────────────────────── */
export default function Page() {
  // flow
  const [active, setActive] = useState<StepId | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);

  // panels
  const [proposalsCleared, setProposalsCleared] = useState(true);
  const [receipt, setReceipt] = useState<unknown>("{ pending }");

  // KPIs
  const [afterMode, setAfterMode] = useState(false);
  const totalsBefore = useMemo(() => beforeTotals(SKUS), []);
  const totalsAfter = useMemo(() => afterTotals(SKUS), []);
  const totals = afterMode ? totalsAfter : totalsBefore;

  // proposals text + csv
  const proposals = useMemo(() => proposePrices(SKUS), []);
  const proposalsText = proposals
    .map((p) => `SKU ${p.sku}: ${p.before.toFixed(2)} → ${p.after.toFixed(2)} — ${p.rationale}`)
    .join("\n");
  const proposalsCsv = proposals.map((p) => ({
    sku: p.sku,
    before: p.before,
    after: p.after,
    rationale: p.rationale,
  }));

  // “How it works”
  const howText = [
    "#1 Goal",
    "Maximize profit while protecting MAP & margin floors, and staying competitive.",
    "",
    "#2 Columns",
    "Left: Catalog and actions.",
    "Middle: Agent timeline + Proposed Prices + Receipt.",
    "Right: KPIs (Before vs After).",
    "",
    "#3 Buttons",
    "Start Pricing Run: plays steps and shows proposals.",
    "Approve Prices: creates the receipt and flips KPIs to After.",
    "Reset: clears everything and returns KPIs to Before.",
    "",
    "#4 Heuristics (demo)",
    "Elastic: -$0.50 (≥ MAP). Neutral: -$0.20 (≥ MAP). Inelastic: +$0.50 (≤ competitor + $1). Round to .99.",
    "",
    "#5 Receipt",
    "Immutable-style payload with proposals, KPI before/after, rollback token, timestamp.",
  ].join("\n");

  /** timeline animation */
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
      if (s === "Approval") setCanApprove(true);
      i += 1;
      if (i < STEPS.length) timerRef = window.setTimeout(tick, 900);
    };
    setActive("Plan");
    timerRef = window.setTimeout(tick, 900);
  };

  /** actions */
  const onStart = () => {
    clearTimers();
    setApproved(false);
    setCanApprove(false);
    setAfterMode(false);
    setProposalsCleared(false);
    setReceipt("{ awaiting approval }");
    startSequence();
  };

  const onApprove = () => {
    if (!canApprove) return;
    setApproved(true);
    setCanApprove(false);
    setActive("Apply & Log");
    setAfterMode(true);
    setReceipt({
      run_id: "A9-PRICING-001",
      approved: true,
      proposals,
      kpis_before: totalsBefore,
      kpis_after: totalsAfter,
      rollback_token: "RBK-PRC-xx51",
      timestamp: new Date().toISOString(),
    });
  };

  const onResetAll = () => {
    clearTimers();
    setActive(null);
    setApproved(false);
    setCanApprove(false);
    setAfterMode(false);
    setProposalsCleared(true);
    setReceipt("{ pending }");
  };

  /** ───────────────────────────── Styles ───────────────────────────── */
  const styles: { [k: string]: React.CSSProperties } = {
    page: { background: "#fff", color: "#111", minHeight: "100vh", fontFamily: 'Calibri, Arial, "Times New Roman", system-ui' },
    wrap: { maxWidth: 1120, margin: "24px auto", padding: "0 16px" },
    grid: { display: "grid", gridTemplateColumns: "360px 1fr 320px", gap: 16 },
    card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
    section: { fontSize: 13, letterSpacing: ".3px", color: "#374151", textTransform: "uppercase", margin: "0 0 12px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { fontSize: 12, textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" },
    td: { fontSize: 12, padding: "6px 8px", borderBottom: "1px solid #e5e7eb" },
    btn: { background: "#1d4ed8", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer" },
    subtle: { fontSize: 12, color: "#6b7280" },
    badge: { fontSize: 11, padding: "2px 8px", borderRadius: 9999, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", display: "inline-block", marginBottom: 8 },
    kpiCard: { border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 },
  };

  const timelineItemStyle = (on: boolean): React.CSSProperties => ({
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    marginBottom: 8,
    boxShadow: on ? "inset 0 0 0 2px #bfdbfe" : "none",
  });

  /** ───────────────────────────── Render ───────────────────────────── */
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
          <h1 style={{ fontSize: 22, margin: 0 }}>AURORA9 Pricing & Profit Guardrail Agent</h1>
          <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151" }}>
            Seeded demo — no live APIs
          </span>
        </header>

        <p style={styles.subtle}>
          Optimizes price within MAP and margin floors, respects band controls, targets competitive window, and logs a governance receipt.
        </p>

        <div style={styles.grid}>
          {/* LEFT: Catalog */}
          <section style={styles.card}>
            <h2 style={styles.section}>Seeded Catalog & Signals</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["SKU", "Name", "Cost", "Current", "MAP", "Competitor", "Demand"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SKUS.map((s) => (
                  <tr key={s.sku}>
                    <td style={styles.td}>{s.sku}</td>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{moneyFmt(s.cost)}</td>
                    <td style={styles.td}>{moneyFmt(s.current)}</td>
                    <td style={styles.td}>{moneyFmt(s.map)}</td>
                    <td style={styles.td}>{moneyFmt(s.competitor)}</td>
                    <td style={styles.td}>{s.demand}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button type="button" onClick={onStart} style={styles.btn}>Start Pricing Run</button>
              <button type="button" onClick={onApprove} disabled={!canApprove} style={styles.btn}>Approve Prices</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <InlineNav current="pricing" />
            </div>
          </section>

          {/* MIDDLE: Timeline + Panels */}
          <section style={styles.card}>
            <h2 style={styles.section}>Agent Timeline</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {STEPS.map((s) => (
                <li key={s} style={timelineItemStyle(active === s)}>
                  <strong>{s}</strong>
                </li>
              ))}
            </ul>

            <DetailsPanel
              heading="Proposed Prices"
              detailsText={proposalsCleared ? "{ pending }" : proposalsText}
              techData={proposalsCleared ? "{ pending }" : { proposals }}
              csvRows={proposalsCleared ? undefined : proposalsCsv}
              fileBase="aurora9-pricing-proposals"
              onReset={onResetAll}
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset Proposals</button>
            </div>

            <DetailsPanel
              heading="Governance Receipt"
              detailsText={approved ? "Receipt created. Use the technical toggle for full payload." : "{ pending }"}
              techData={receipt}
              fileBase="aurora9-pricing-receipt"
              onReset={onResetAll}
              variant="receipt"
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset Receipt</button>
            </div>

            <DetailsPanel
              heading="How it works"
              detailsText={howText}
              fileBase="aurora9-pricing-howto"
              /* no onReset for the info-only panel */
            />
          </section>

          {/* RIGHT: KPIs */}
          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={styles.badge}>{afterMode ? "After (simulated)" : "Before"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={styles.kpiCard}>
                <div style={styles.subtle}>Avg Margin</div>
                <div style={{ fontSize: 18 }}>{pctFmt(totals.avgMarginPct)}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.subtle}>Buy Box Price Δ (Avg)</div>
                <div style={{ fontSize: 18 }}>
                  {totals.buyBoxDeltaAvg >= 0 ? "+" : ""}
                  {moneyFmt(Math.abs(totals.buyBoxDeltaAvg))}
                  <span style={{ fontSize: 13, color: "#6b7280" }}> vs comp</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
