"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";

type MatchType = "exact" | "phrase" | "broad";
type Row = { campaign: string; adGroup: string; keyword: string; match: MatchType; impr: number; clicks: number; spend: number; sales: number; orders: number; bid: number; };
type CampaignPolicy = { campaign: string; targetROAS: number; minClicks: number; bidFloor: number; bidCeil: number; dailyBudget: number; maxReallocPct: number; };
type BidChange = { campaign: string; adGroup: string; keyword: string; match: MatchType; currentBid: number; newBid: number; rationale: string; };
type Negative = { campaign: string; adGroup: string; keyword: string; match: MatchType; reason: string; };
type BudgetMove = { from: string; to: string; amount: number; rationale: string; };

const POLICY: CampaignPolicy[] = [
  { campaign: "Campaign A", targetROAS: 3.0, minClicks: 10, bidFloor: 0.2, bidCeil: 2.5, dailyBudget: 100, maxReallocPct: 0.20 },
  { campaign: "Campaign B", targetROAS: 2.5, minClicks: 12, bidFloor: 0.15, bidCeil: 2.0, dailyBudget: 80,  maxReallocPct: 0.20 },
];

const DATA: Row[] = [
  { campaign: "Campaign A", adGroup: "Chargers", keyword: "usb c wall charger", match: "exact",  impr: 5200, clicks: 260, spend: 182.0, sales: 820.0, orders: 82, bid: 0.95 },
  { campaign: "Campaign A", adGroup: "Chargers", keyword: "fast iphone charger", match: "phrase", impr: 3800, clicks: 120, spend: 96.0,  sales: 180.0, orders: 18, bid: 0.85 },
  { campaign: "Campaign A", adGroup: "Chargers", keyword: "cheap fast charger", match: "broad",  impr: 4100, clicks: 70,  spend: 63.0,  sales: 0.0,   orders: 0,  bid: 0.70 },
  { campaign: "Campaign B", adGroup: "Cables",   keyword: "usb c cable 2 pack", match: "exact",  impr: 6000, clicks: 210, spend: 126.0, sales: 540.0, orders: 90, bid: 0.80 },
  { campaign: "Campaign B", adGroup: "Cables",   keyword: "long usb c cable",   match: "phrase", impr: 4200, clicks: 84,  spend: 56.0,  sales: 160.0, orders: 20, bid: 0.65 },
  { campaign: "Campaign B", adGroup: "Cables",   keyword: "best usb c cable",   match: "broad",  impr: 4700, clicks: 95,  spend: 90.0,  sales: 150.0, orders: 12, bid: 0.75 },
];

function cpc(r: Row) { return r.clicks > 0 ? r.spend / r.clicks : 0; }
function ctr(r: Row) { return r.impr > 0 ? r.clicks / r.impr : 0; }
function acos(r: Row) { return r.sales > 0 ? r.spend / r.sales : Infinity; }
function roas(r: Row) { return r.spend > 0 ? r.sales / r.spend : 0; }
function convRate(r: Row) { return r.clicks > 0 ? r.orders / r.clicks : 0; }
function money(n: number) { return "$" + n.toFixed(2); }
function pct(n: number) { return (n * 100).toFixed(1) + "%"; }
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function roundBid(n: number) { return Math.round(n * 100) / 100; }

function proposeBid(r: Row, policy: CampaignPolicy): BidChange | Negative | null {
  if (r.clicks >= policy.minClicks && r.orders === 0) {
    return { campaign: r.campaign, adGroup: r.adGroup, keyword: r.keyword, match: r.match, reason: "High clicks, zero orders over window" } as Negative;
  }
  const kRoas = roas(r);
  if (r.clicks < policy.minClicks) return null;

  let delta = 0;
  if (kRoas < policy.targetROAS) {
    const gap = Math.min(1, (policy.targetROAS - kRoas) / policy.targetROAS);
    delta = -r.bid * (0.10 + 0.15 * gap);
  } else {
    const lift = Math.min(1, (kRoas - policy.targetROAS) / policy.targetROAS);
    delta = r.bid * (0.05 + 0.10 * lift);
  }

  const nb = roundBid(clamp(r.bid + delta, policy.bidFloor, policy.bidCeil));
  if (nb === r.bid) return null;

  const rationale =
    (kRoas < policy.targetROAS
      ? `ROAS ${kRoas.toFixed(2)} below target ${policy.targetROAS.toFixed(2)} → lower bid`
      : `ROAS ${kRoas.toFixed(2)} above target ${policy.targetROAS.toFixed(2)} → raise bid`) +
    `; clicks ${r.clicks}, conv ${(convRate(r) * 100).toFixed(1)}%, CPC ${money(cpc(r))}.`;

  return { campaign: r.campaign, adGroup: r.adGroup, keyword: r.keyword, match: r.match, currentBid: r.bid, newBid: nb, rationale };
}

function summarizeCampaign(campaign: string, rows: Row[]) {
  const s = rows
    .filter((r) => r.campaign === campaign)
    .reduce(
      (a, r) => {
        a.impr += r.impr;
        a.clicks += r.clicks;
        a.spend += r.spend;
        a.sales += r.sales;
        a.orders += r.orders;
        return a;
      },
      { impr: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }
    );
  return { ...s, ctr: s.impr ? s.clicks / s.impr : 0, cpc: s.clicks ? s.spend / s.clicks : 0, roas: s.spend ? s.sales / s.spend : 0, acos: s.sales ? s.spend / s.sales : Infinity };
}

function planBudgetMoves(rows: Row[], policy: CampaignPolicy[]): BudgetMove[] {
  const sums = policy.map((p) => ({ p, s: summarizeCampaign(p.campaign, rows) }));
  const sorted = [...sums].sort((a, b) => b.s.roas - a.s.roas);
  const worst = sorted[sorted.length - 1];
  const best = sorted[0];
  if (!worst || !best || worst.p.campaign === best.p.campaign) return [];
  const amount = Math.min(worst.p.dailyBudget * worst.p.maxReallocPct, 20);
  if (amount <= 0) return [];
  return [
    {
      from: worst.p.campaign,
      to: best.p.campaign,
      amount,
      rationale: `Shift ${money(amount)} from lower ROAS (${worst.s.roas.toFixed(2)}) to higher ROAS (${best.s.roas.toFixed(2)})`,
    },
  ];
}

const colors = { bg: "#fff", ink: "#111", muted: "#6b7280", border: "#e5e7eb", card: "#fff", accent: "#1d4ed8", good: "#0a7f2e", warn: "#b45309" } as const;

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
  mono: { fontFamily: 'Consolas, "Courier New", monospace', fontSize: 12, color: "#111", background: "#fff", border: `1px solid ${colors.border}`, borderRadius: 8, padding: 8, whiteSpace: "pre-wrap", overflow: "auto" },
  kpis: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } as React.CSSProperties,
  kpi: { padding: 10, border: `1px solid ${colors.border}`, borderRadius: 10, background: "#f9fafb" },
  kpiGood: { padding: 10, border: `1px solid ${colors.border}`, borderRadius: 10, background: "#f0fdf4" },
  kpiWarn: { padding: 10, border: `1px solid ${colors.border}`, borderRadius: 10, background: "#fff7ed" },
  kpiLabel: { fontSize: 12, color: colors.muted },
  kpiValue: { fontSize: 18, marginTop: 2 },
  kpiValueGood: { fontSize: 18, marginTop: 2, color: colors.good },
  kpiValueWarn: { fontSize: 18, marginTop: 2, color: colors.warn },
};

function btn(): React.CSSProperties {
  return { background: colors.accent, color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 600, outlineColor: "#93c5fd" };
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);

  const bidChanges = useMemo(() => {
    const out: (BidChange | Negative)[] = [];
    for (const row of DATA) {
      const pol = POLICY.find((p) => p.campaign === row.campaign)!;
      const c = proposeBid(row, pol);
      if (c) out.push(c);
    }
    return out;
  }, []);

  const budgetMoves = useMemo(() => planBudgetMoves(DATA, POLICY), []);
  const totals = useMemo(
    () => DATA.reduce((a, r) => { a.impr += r.impr; a.clicks += r.clicks; a.spend += r.spend; a.sales += r.sales; a.orders += r.orders; return a; }, { impr: 0, clicks: 0, spend: 0, sales: 0, orders: 0 }),
    []
  );
  const [receipt, setReceipt] = useState("{ pending }");

  function onStart() {
    setStarted(true);
    setApproved(false);
    setCanApprove(false);
    setReceipt("{ pending }");
    // simple simulated gate to enable approval
    setTimeout(() => setCanApprove(true), 900);
  }

  function onApprove() {
    setApproved(true);
    setCanApprove(false);
    const changeSet = bidChanges.map((c) =>
      "newBid" in c
        ? { type: "bid_change", campaign: c.campaign, ad_group: c.adGroup, keyword: c.keyword, match: c.match, before: c.currentBid, after: c.newBid, rationale: c.rationale }
        : { type: "negative", campaign: c.campaign, ad_group: c.adGroup, keyword: c.keyword, match: c.match, reason: c.reason }
    );
    const payload = {
      run_id: "A9-PPC-2025-09-23-001",
      approved: true,
      approver: "PPCLead@demo",
      policy_pack: POLICY,
      change_set: changeSet,
      budget_moves: budgetMoves,
      kpis: {
        spend: totals.spend,
        sales: totals.sales,
        ctr: totals.impr ? totals.clicks / totals.impr : 0,
        cpc: totals.clicks ? totals.spend / totals.clicks : 0,
        roas: totals.spend ? totals.sales / totals.spend : 0,
        acos: totals.sales ? totals.spend / totals.sales : Infinity,
      },
      rollback_token: "RBK-PPC-77aa22",
      timestamp: new Date().toISOString(),
    };
    setReceipt(JSON.stringify(payload, null, 2));
  }

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.wrap}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Image src="/aurora9-logo.jpg" alt="AURORA9 logo" width={200} height={48} priority style={{ height: 36, width: "auto", objectFit: "contain" }} />
          <h1 style={{ fontSize: 22, margin: 0 }}>AURORA9 PPC / CPC / Bidding Agent</h1>
          <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 8, border: "1px solid #e5e7eb", color: "#374151", background: "#f9fafb" }}>Seeded demo — no live APIs</span>
        </header>
        <p style={styles.sub}>Keyword metrics + bid changes, negatives, and budget moves with governance & approval.</p>

        <div style={styles.grid}>
          <section style={styles.card}>
            <h2 style={styles.section}>Seeded PPC Metrics</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Campaign</th>
                  <th style={styles.th}>Ad Group</th>
                  <th style={styles.th}>Keyword</th>
                  <th style={styles.th}>Match</th>
                  <th style={styles.th}>Impr</th>
                  <th style={styles.th}>Clicks</th>
                  <th style={styles.th}>CTR</th>
                  <th style={styles.th}>CPC</th>
                  <th style={styles.th}>Spend</th>
                  <th style={styles.th}>Sales</th>
                  <th style={styles.th}>ROAS</th>
                  <th style={styles.th}>ACoS</th>
                  <th style={styles.th}>Bid</th>
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
                    <td style={styles.td}>{isFinite(acos(r)) ? pct(acos(r)) : "∞"}</td>
                    <td style={styles.td}>{money(r.bid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={onStart} disabled={started && !canApprove} style={btn()}>
                Start PPC Run
              </button>
              <button onClick={onApprove} disabled={!canApprove} style={btn()}>
                Approve Changes
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              <InlineNav current="ads" />
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.section}>Proposed Actions</h2>
            <pre style={styles.mono}>
              {started
                ? [
                    ...bidChanges.map((c) =>
                      "newBid" in c
                        ? `- BID   | ${c.campaign} / ${c.adGroup} | "${c.keyword}" [${c.match}]  ${money(c.currentBid)} → ${money(c.newBid)}  — ${c.rationale}`
                        : `- NEG   | ${c.campaign} / ${c.adGroup} | "${c.keyword}" [${c.match}]  — ${c.reason}`
                    ),
                    ...budgetMoves.map((m) => `- BUDGET| ${m.from} → ${m.to}  ${money(m.amount)}  — ${m.rationale}`),
                  ].join("\n")
                : "{ pending }"}
            </pre>

            <h2 style={styles.section}>Governance Receipt</h2>
            <pre style={styles.mono}>{approved ? receipt : started ? "{ awaiting approval }" : "{ pending }"}</pre>
          </section>

          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={styles.kpis}>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Spend</div>
                <div style={styles.kpiValue}>{money(totals.spend)}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>Sales</div>
                <div style={styles.kpiValue}>{money(totals.sales)}</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>CTR</div>
                <div style={styles.kpiValue}>{pct(totals.impr ? totals.clicks / totals.impr : 0)}</div>
              </div>
              <div style={styles.kpiWarn}>
                <div style={styles.kpiLabel}>CPC</div>
                <div style={styles.kpiValueWarn}>{money(totals.clicks ? totals.spend / totals.clicks : 0)}</div>
              </div>
              <div style={styles.kpiGood}>
                <div style={styles.kpiLabel}>ROAS</div>
                <div style={styles.kpiValueGood}>{(totals.spend ? totals.sales / totals.spend : 0).toFixed(2)}x</div>
              </div>
              <div style={styles.kpi}>
                <div style={styles.kpiLabel}>ACoS</div>
                <div style={styles.kpiValue}>{isFinite(totals.sales ? totals.spend / totals.sales : Infinity) ? pct(totals.sales ? totals.spend / totals.sales : 0) : "∞"}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
