"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";
import DetailsPanel from "../components/DetailsPanel";

/** ===== Types ===== */
type StepId =
  | "Plan"
  | "Pull Signals"
  | "Forecast"
  | "Constraints"
  | "Decision"
  | "Approval"
  | "Create PO & Log";

type SkuRow = {
  sku: string;
  onHand: number;
  onOrder: number;
  dailySales: number; // seeded average daily sales
  leadTimeDays: number;
  uom?: string;
};

type Policy = {
  minDaysCover: number;       // safety buffer (days of cover you want on shelf)
  maxPOCap: number;           // cap per PO (units)
  workingCapitalCap: number;  // not used for math in demo, printed to receipt
  minOrderQty: number;
};

type ProposedPO = {
  sku: string;
  qty: number;
  rationale: string;
};

type Totals = {
  oosRiskPct: number;     // 0..1
  inventoryTurn: number;  // x
  fillRatePct: number;    // 0..1
  workingCapital: number; // $
};

/** ===== Seeded data ===== */
const STEPS: StepId[] = [
  "Plan",
  "Pull Signals",
  "Forecast",
  "Constraints",
  "Decision",
  "Approval",
  "Create PO & Log",
];

const POLICY: Policy = {
  minDaysCover: 21,
  maxPOCap: 500,
  workingCapitalCap: 50_000,
  minOrderQty: 50,
};

const SEED: SkuRow[] = [
  { sku: "SKU-A", onHand: 1200, onOrder: 0,  dailySales: 85, leadTimeDays: 18, uom: "units" },
  { sku: "SKU-B", onHand: 800,  onOrder: 0,  dailySales: 60, leadTimeDays: 14, uom: "units" },
  { sku: "SKU-C", onHand: 300,  onOrder: 0,  dailySales: 28, leadTimeDays: 30, uom: "units" },
];

/** ===== Helpers ===== */
const money = (n: number) => "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const pct = (n: number) => (n * 100).toFixed(1) + " percent";

/** Rough demand-over-lead-time need with safety buffer */
function recommendedQty(row: SkuRow, policy: Policy): number {
  const needOverLT = row.dailySales * (row.leadTimeDays + policy.minDaysCover);
  const shortfall = Math.max(0, Math.ceil(needOverLT - (row.onHand + row.onOrder)));
  if (shortfall === 0) return 0;
  const capped = Math.min(Math.max(shortfall, policy.minOrderQty), policy.maxPOCap);
  return capped;
}

/** Build proposed POs with rationale text */
function proposePOs(rows: SkuRow[], policy: Policy): ProposedPO[] {
  return rows
    .map((r) => {
      const qty = recommendedQty(r, policy);
      if (qty === 0) return null;
      const rationale = `Need ${(r.leadTimeDays + policy.minDaysCover)} days cover; demand ${r.dailySales}/day; on-hand ${r.onHand}, on-order ${r.onOrder}.`;
      return { sku: r.sku, qty, rationale };
    })
    .filter(Boolean) as ProposedPO[];
}

/** Seeded KPI snapshot (Before) */
function beforeTotals(): Totals {
  return {
    oosRiskPct: 0.098,      // 9.8%
    inventoryTurn: 8.2,     // 8.2x
    fillRatePct: 0.951,     // 95.1%
    workingCapital: 63_400, // $
  };
}

/** Simulated "After approval" improvement */
function afterTotals(b: Totals): Totals {
  return {
    oosRiskPct: Math.max(0, b.oosRiskPct - 0.051),   // -5.1 pts
    inventoryTurn: b.inventoryTurn + 0.3,            // +0.3x
    fillRatePct: Math.min(1, b.fillRatePct + 0.023), // +2.3 pts
    workingCapital: b.workingCapital + 12_500,       // +$12.5k deployed
  };
}

/** ===== Page ===== */
export default function Page() {
  /** Flow state */
  const [active, setActive] = useState<StepId | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);

  /** Visual toggles for panels (so Reset is obvious) */
  const [posCleared, setPOsCleared] = useState(true);      // Proposed POs panel starts as { pending }
  const [receipt, setReceipt] = useState<unknown>("{ pending }");

  /** KPI mode: false = Before, true = After (sim) */
  const [afterMode, setAfterMode] = useState(false);

  /** Derived data */
  const rows = SEED;
  const policy = POLICY;
  const proposals = useMemo(() => proposePOs(rows, policy), [rows, policy]);
  const totalsBefore = useMemo(() => beforeTotals(), []);
  const totalsAfter = useMemo(() => afterTotals(totalsBefore), [totalsBefore]);
  const totals = afterMode ? totalsAfter : totalsBefore;

  /** “How it works” content */
  const howText = [
    "#1 Goal",
    "Avoid stockouts while minimizing working capital. Forecast demand, propose POs, apply guardrails, require approval, then log a receipt.",
    "",
    "#2 Columns",
    "Left: Seeded scenario table and actions.",
    "Middle: Agent timeline + Proposed POs + Governance Receipt.",
    "Right: KPIs (Before vs After simulation).",
    "",
    "#3 Buttons",
    "Start Demo: plays the timeline and shows proposed POs.",
    "Approve POs: creates the receipt and flips KPIs to After.",
    "Reset: clears timeline, reverts panels to { pending }, sets KPIs to Before.",
    "",
    "#4 Math (demo heuristics)",
    "Need = dailySales × (leadTime + safety buffer).",
    "Qty = max(minOrderQty, min(Need − (onHand + onOrder), maxPOCap)).",
    "",
    "#5 Guardrails",
    "Min order qty, max PO cap, safety buffer, human approval required.",
    "",
    "#6 Receipt",
    "Immutable-style payload with policy, proposals, KPI before/after, rollback token, timestamp.",
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
      if (s === "Approval") setCanApprove(true);
      i += 1;
      if (i < STEPS.length) timerRef = window.setTimeout(tick, 900);
    };
    setActive("Plan");
    timerRef = window.setTimeout(tick, 900);
  };

  /** Actions */
  const onStart = () => {
    clearTimers();
    setApproved(false);
    setCanApprove(false);
    setPOsCleared(false);            // show proposals
    setReceipt("{ awaiting approval }");
    setAfterMode(false);             // ensure KPIs are in "Before"
    startSequence();
  };

  const onApprove = () => {
    if (!canApprove) return;
    setApproved(true);
    setCanApprove(false);
    setActive("Create PO & Log");
    setAfterMode(true);              // flip KPIs to "After (sim)"

    const receiptPayload = {
      run_id: "A9-INV-001",
      approved: true,
      policy,
      proposed_pos: proposals,
      kpis_before: totalsBefore,
      kpis_after: totalsAfter,
      rollback_token: "RBK-INV-xx11",
      timestamp: new Date().toISOString(),
    };
    setReceipt(receiptPayload);
  };

  const onResetAll = () => {
    clearTimers();
    setActive(null);
    setApproved(false);
    setCanApprove(false);
    setPOsCleared(true);             // visually clear proposals → { pending }
    setReceipt("{ pending }");
    setAfterMode(false);             // return KPIs to "Before"
  };

  /** Panels text + CSV */
  const poLines = proposals
    .map((p) => `PO  ${p.sku}  qty ${p.qty} — ${p.rationale}`)
    .join("\n");

  const poCsvRows = proposals.map((p) => ({
    type: "po",
    sku: p.sku,
    qty: p.qty,
    rationale: p.rationale,
  }));

  /** ===== Styles ===== */
  const styles: Record<string, React.CSSProperties> = {
    page: { background: "#fff", color: "#111", minHeight: "100vh", fontFamily: 'Calibri, Arial, "Times New Roman", system-ui' },
    wrap: { maxWidth: 1120, margin: "24px auto", padding: "0 16px" },
    grid: { display: "grid", gridTemplateColumns: "360px 1fr 320px", gap: 16 } as React.CSSProperties,
    card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
    section: { fontSize: 13, letterSpacing: ".3px", color: "#374151", textTransform: "uppercase", margin: "0 0 12px" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { fontSize: 12, textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" },
    td: { fontSize: 12, padding: "6px 8px", borderBottom: "1px solid #e5e7eb" },
    btn: { background: "#1d4ed8", color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, fontWeight: 600, cursor: "pointer" } as React.CSSProperties,
    subtle: { fontSize: 12, color: "#6b7280" },
    badge: { fontSize: 11, padding: "2px 8px", borderRadius: 9999, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151", display: "inline-block", marginBottom: 8 },
  };
  const timelineItemStyle = (on: boolean): React.CSSProperties => ({
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    background: "#f9fafb",
    marginBottom: 8,
    boxShadow: on ? "inset 0 0 0 2px #bfdbfe" : "none",
  });

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.wrap}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Image src="/aurora9-logo.jpg" alt="AURORA9 logo" width={200} height={48} priority style={{ height: 36, width: "auto", objectFit: "contain" }} />
          <h1 style={{ fontSize: 22, margin: 0 }}>AURORA9 Inventory Agent Demo</h1>
          <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151" }}>
            Seeded demo — no live APIs
          </span>
        </header>
        <p style={styles.subtle}>Seeded demo: forecasts demand, enforces constraints, proposes POs, awaits approval, then logs a receipt.</p>

        <div style={styles.grid}>
          {/* LEFT: Scenario table */}
          <section style={styles.card}>
            <h2 style={styles.section}>Scenario</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["SKU", "On Hand", "On Order", "Daily Sales", "Lead Time"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sku}>
                    <td style={styles.td}>{r.sku}</td>
                    <td style={styles.td}>{r.onHand.toLocaleString()} {r.uom}</td>
                    <td style={styles.td}>{r.onOrder.toLocaleString()} {r.uom}</td>
                    <td style={styles.td}>{r.dailySales}/day</td>
                    <td style={styles.td}>{r.leadTimeDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button type="button" onClick={onStart} style={styles.btn}>Start Demo</button>
              <button type="button" onClick={onApprove} disabled={!canApprove} style={styles.btn}>Approve POs</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <InlineNav current="inventory" />
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
              heading="Proposed POs"
              detailsText={posCleared ? "{ pending }" : poLines}
              techData={posCleared ? "{ pending }" : { proposed_pos: proposals, policy }}
              csvRows={posCleared ? undefined : poCsvRows}
              fileBase="aurora9-inventory-proposals"
              onReset={onResetAll}
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset POs</button>
            </div>

            <DetailsPanel
              heading="Governance Receipt"
              detailsText={approved ? "Receipt created. Use the technical toggle for full payload." : "{ pending }"}
              techData={receipt}
              fileBase="aurora9-inventory-receipt"
              onReset={onResetAll}
              variant="receipt"
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset Receipt</button>
            </div>

            <DetailsPanel
              heading="How it works"
              detailsText={howText}
              fileBase="aurora9-inventory-howto"
              /* no onReset here – informational panel should not show a Reset button */
            />
          </section>

          {/* RIGHT: KPIs with Before/After switch */}
          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={styles.badge}>{afterMode ? "After (simulated)" : "Before"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>OOS Risk</div>
                <div style={{ fontSize: 18 }}>{pct(totals.oosRiskPct)}</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>Inventory Turn</div>
                <div style={{ fontSize: 18 }}>{totals.inventoryTurn.toFixed(1)}x</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>Fill Rate</div>
                <div style={{ fontSize: 18 }}>{pct(totals.fillRatePct)}</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>Working Capital</div>
                <div style={{ fontSize: 18 }}>{money(totals.workingCapital)}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
