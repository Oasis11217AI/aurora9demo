"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";
import DetailsPanel from "../components/DetailsPanel";
import { HOWTO_PPC } from "../components/HowTo";

/** ---------- Types ---------- */
type MatchType = "exact" | "phrase" | "broad";
type Row = {
  campaign: string;
  adGroup: string;
  keyword: string;
  match: MatchType;
  impr: number;
  clicks: number;
  spend: number;
  sales: number;
  orders: number;
  bid: number;
};
type CampaignPolicy = {
  campaign: string;
  targetROAS: number;
  minClicks: number;
  bidFloor: number;
  bidCeil: number;
  dailyBudget: number;
  maxReallocPct: number;
};
type BidChange = {
  campaign: string;
  adGroup: string;
  keyword: string;
  match: MatchType;
  currentBid: number;
  newBid: number;
  rationale: string;
};
type Negative = {
  campaign: string;
  adGroup: string;
  keyword: string;
  match: MatchType;
  reason: string;
};
type BudgetMove = { from: string; to: string; amount: number; rationale: string };
type StepId =
  | "Plan"
  | "Load Metrics"
  | "Propose Bids"
  | "Budget Realloc"
  | "Approval"
  | "Apply & Log";

/** ---------- Seed ---------- */
const STEPS: StepId[] = [
  "Plan",
  "Load Metrics",
  "Propose Bids",
  "Budget Realloc",
  "Approval",
  "Apply & Log",
];

const POLICY: CampaignPolicy[] = [
  { campaign: "Campaign A", targetROAS: 3.0, minClicks: 10, bidFloor: 0.2, bidCeil: 2.5, dailyBudget: 100, maxReallocPct: 0.2 },
  { campaign: "Campaign B", targetROAS: 2.5, minClicks: 12, bidFloor: 0.15, bidCeil: 2.0, dailyBudget: 80, maxReallocPct: 0.2 },
];

const DATA: Row[] = [
  { campaign: "Campaign A", adGroup: "Chargers", keyword: "usb c wall charger", match: "exact", impr: 5200, clicks: 260, spend: 182.0, sales: 820.0, orders: 82, bid: 0.95 },
  { campaign: "Campaign A", adGroup: "Chargers", keyword: "fast iphone charger", match: "phrase", impr: 3800, clicks: 120, spend: 96.0, sales: 180.0, orders: 18, bid: 0.85 },
  { campaign: "Campaign A", adGroup: "Chargers", keyword: "cheap fast charger", match: "broad", impr: 4100, clicks: 70, spend: 63.0, sales: 0.0, orders: 0, bid: 0.70 },
  { campaign: "Campaign B", adGroup: "Cables", keyword: "usb c cable 2 pack", match: "exact", impr: 6000, clicks: 210, spend: 126.0, sales: 540.0, orders: 90, bid: 0.80 },
  { campaign: "Campaign B", adGroup: "Cables", keyword: "long usb c cable", match: "phrase", impr: 4200, clicks: 84, spend: 56.0, sales: 160.0, orders: 20, bid: 0.65 },
  { campaign: "Campaign B", adGroup: "Cables", keyword: "best usb c cable", match: "broad", impr: 4700, clicks: 95, spend: 90.0, sales: 150.0, orders: 12, bid: 0.75 },
];

/** ---------- Helpers ---------- */
const cpc = (r: Row) => (r.clicks > 0 ? r.spend / r.clicks : 0);
const ctr = (r: Row) => (r.impr > 0 ? r.clicks / r.impr : 0);
const roas = (r: Row) => (r.spend > 0 ? r.sales / r.spend : 0);
const conv = (r: Row) => (r.clicks > 0 ? r.orders / r.clicks : 0);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const roundBid = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => "$" + n.toFixed(2);
const pct = (n: number) => (n * 100).toFixed(1) + "%";

function proposeBid(r: Row, p: CampaignPolicy): BidChange | Negative | null {
  if (r.clicks >= p.minClicks && r.orders === 0) {
    return { campaign: r.campaign, adGroup: r.adGroup, keyword: r.keyword, match: r.match, reason: "High clicks, zero orders" };
  }
  if (r.clicks < p.minClicks) return null;

  const k = roas(r);
  const delta =
    k < p.targetROAS
      ? -(r.bid * (0.10 + 0.15 * Math.min(1, (p.targetROAS - k) / p.targetROAS)))
      : r.bid * (0.05 + 0.10 * Math.min(1, (k - p.targetROAS) / p.targetROAS));
  const nb = roundBid(clamp(r.bid + delta, p.bidFloor, p.bidCeil));
  if (nb === r.bid) return null;

  const rationale =
    (k < p.targetROAS
      ? `ROAS ${k.toFixed(2)} < target ${p.targetROAS.toFixed(2)} → lower bid`
      : `ROAS ${k.toFixed(2)} > target ${p.targetROAS.toFixed(2)} → raise bid`) +
    `; clicks ${r.clicks}, conv ${(conv(r) * 100).toFixed(1)}%, CPC ${money(cpc(r))}`;

  return { campaign: r.campaign, adGroup: r.adGroup, keyword: r.keyword, match: r.match, currentBid: r.bid, newBid: nb, rationale };
}

function summarizeCampaign(c: string, rows: Row[]) {
  return rows
    .filter((r) => r.campaign === c)
    .reduce(
      (a, r) => {
        a.impr += r.impr;
        a.clicks += r.clicks;
        a.spend += r.spend;
        a.sales += r.sales;
        return a;
      },
      { impr: 0, clicks: 0, spend: 0, sales: 0 }
    );
}

function planBudgetMoves(rows: Row[], p: CampaignPolicy[]): BudgetMove[] {
  const s = p
    .map((pp) => ({ pp, s: summarizeCampaign(pp.campaign, rows) }))
    .sort((a, b) => (b.s.spend ? b.s.sales / b.s.spend : 0) - (a.s.spend ? a.s.sales / a.s.spend : 0));
  if (s.length < 2) return [];
  const worst = s[s.length - 1], best = s[0];
  const amt = Math.min(worst.pp.dailyBudget * worst.pp.maxReallocPct, 20);
  return amt > 0 ? [{ from: worst.pp.campaign, to: best.pp.campaign, amount: amt, rationale: `Shift ${money(amt)} from lower to higher ROAS` }] : [];
}

/** ---------- Component ---------- */
export default function Page() {
  // flow state
  const [active, setActive] = useState<StepId | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);
  const [receipt, setReceipt] = useState<unknown>("{ pending }");

  // NEW: clear proposals view so Reset is visually obvious
  const [proposalsCleared, setProposalsCleared] = useState(true); // start cleared

  // proposals & totals
  const bidChanges = useMemo(
    () => (DATA.map((r) => proposeBid(r, POLICY.find((p) => p.campaign === r.campaign)!)).filter(Boolean) as (BidChange | Negative)[]),
    []
  );
  const budgetMoves = useMemo(() => planBudgetMoves(DATA, POLICY), []);
  const totals = useMemo(
    () =>
      DATA.reduce(
        (a, r) => {
          a.impr += r.impr;
          a.clicks += r.clicks;
          a.spend += r.spend;
          a.sales += r.sales;
          return a;
        },
        { impr: 0, clicks: 0, spend: 0, sales: 0 }
      ),
    []
  );

  // timeline animation
  let timerRef: number | undefined;
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
  const clearTimers = () => {
    if (timerRef) {
      clearTimeout(timerRef);
      timerRef = undefined;
    }
  };

  const onStart = () => {
    clearTimers();
    setApproved(false);
    setCanApprove(false);
    setReceipt("{ awaiting approval }");
    setProposalsCleared(false);   // show proposed actions again
    startSequence();
  };

  const onApprove = () => {
    if (!canApprove) return;
    setApproved(true);
    setCanApprove(false);
    setActive("Apply & Log");

    const changeSet = bidChanges.map((c) =>
      "newBid" in c
        ? {
            type: "bid_change",
            campaign: c.campaign,
            ad_group: c.adGroup,
            keyword: c.keyword,
            match: c.match,
            before: c.currentBid,
            after: c.newBid,
            rationale: c.rationale,
          }
        : {
            type: "negative",
            campaign: c.campaign,
            ad_group: c.adGroup,
            keyword: c.keyword,
            match: c.match,
            reason: c.reason,
          }
    );

    setReceipt({
      run_id: "A9-PPC-001",
      approved: true,
      policy_pack: POLICY,
      change_set: changeSet,
      budget_moves: budgetMoves,
      kpis: {
        spend: totals.spend,
        sales: totals.sales,
        ctr: totals.impr ? totals.clicks / totals.impr : 0,
        cpc: totals.clicks ? totals.spend / totals.clicks : 0,
        roas: totals.spend ? totals.sales / totals.spend : 0,
      },
      rollback_token: "RBK-PPC-xx22",
      timestamp: new Date().toISOString(),
    });
  };

  const onResetAll = () => {
    clearTimers();
    setActive(null);
    setApproved(false);
    setCanApprove(false);
    setReceipt("{ pending }");
    setProposalsCleared(true); // visually clear the proposals panel
  };

  // strings for panels
  const detailsLines = [
    ...bidChanges.map((c) =>
      "newBid" in c
        ? `BID  ${c.campaign}/${c.adGroup}  "${c.keyword}" [${c.match}]  $${c.currentBid.toFixed(2)} → $${c.newBid.toFixed(2)} — ${c.rationale}`
        : `NEG  ${c.campaign}/${c.adGroup}  "${c.keyword}" [${c.match}] — ${c.reason}`
    ),
    ...budgetMoves.map((m) => `BUDGET  ${m.from} → ${m.to}  $${m.amount.toFixed(2)} — ${m.rationale}`),
  ].join("\n");

  const csvRows = bidChanges.map((c) =>
    "newBid" in c
      ? { type: "bid_change", campaign: c.campaign, ad_group: c.adGroup, keyword: c.keyword, match: c.match, before: c.currentBid, after: c.newBid }
      : { type: "negative", campaign: c.campaign, ad_group: c.adGroup, keyword: c.keyword, match: c.match, reason: c.reason }
  );

  /** ---------- Styles ---------- */
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
          <h1 style={{ fontSize: 22, margin: 0 }}>AURORA9 PPC / CPC / Bidding Agent</h1>
          <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151" }}>
            Seeded demo — no live APIs
          </span>
        </header>
        <p style={styles.subtle}>Keyword metrics + bid changes, negatives, and budget moves with governance & approval.</p>

        <div style={styles.grid}>
          {/* LEFT: Metrics */}
          <section style={styles.card}>
            <h2 style={styles.section}>Seeded PPC Metrics</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Campaign", "Ad Group", "Keyword", "Match", "Impr", "Clicks", "CTR", "CPC", "Spend", "Sales", "ROAS", "Bid"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA.map((r, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{r.campaign}</td>
                    <td style={styles.td}>{r.adGroup}</td>
                    <td style={styles.td}>{r.keyword}</td>
                    <td style={styles.td}>{r.match}</td>
                    <td style={styles.td}>{r.impr.toLocaleString()}</td>
                    <td style={styles.td}>{r.clicks.toLocaleString()}</td>
                    <td style={styles.td}>{pct(ctr(r))}</td>
                    <td style={styles.td}>{money(cpc(r))}</td>
                    <td style={styles.td}>{money(r.spend)}</td>
                    <td style={styles.td}>{money(r.sales)}</td>
                    <td style={styles.td}>{roas(r).toFixed(2)}x</td>
                    <td style={styles.td}>{money(r.bid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button type="button" onClick={onStart} style={styles.btn}>Start PPC Run</button>
              <button type="button" onClick={onApprove} disabled={!canApprove} style={styles.btn}>Approve Changes</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <InlineNav current="ads" />
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

            {/* Proposed Actions panel */}
            <DetailsPanel
              heading="Proposed Actions"
              detailsText={proposalsCleared ? "{ pending }" : detailsLines}
              techData={proposalsCleared ? "{ pending }" : { bid_changes: bidChanges, budget_moves: budgetMoves }}
              csvRows={proposalsCleared ? undefined : csvRows}
              fileBase="aurora9-ppc-proposals"
              onReset={onResetAll}
            />
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset Proposals</button>
            </div>

            {/* Receipt panel */}
            <DetailsPanel
              heading="Governance Receipt"
              detailsText={approved ? "Receipt created. Use the technical toggle for full payload." : "{ pending }"}
              techData={receipt}
              fileBase="aurora9-ppc-receipt"
              onReset={onResetAll}
              variant="receipt"
            />
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={onResetAll} style={styles.btn}>Reset Receipt</button>
            </div>

            <DetailsPanel heading="How it works" detailsText={HOWTO_PPC} fileBase="aurora9-ppc-howto" />
          </section>

          {/* RIGHT: KPIs (seeded view for this demo) */}
          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>Spend</div>
                <div style={{ fontSize: 18 }}>{money(totals.spend)}</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>Sales</div>
                <div style={{ fontSize: 18 }}>{money(totals.sales)}</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>CTR</div>
                <div style={{ fontSize: 18 }}>{pct(totals.impr ? totals.clicks / totals.impr : 0)}</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#f9fafb", padding: 10 }}>
                <div style={styles.subtle}>ROAS</div>
                <div style={{ fontSize: 18 }}>{(totals.spend ? totals.sales / totals.spend : 0).toFixed(2)}x</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
