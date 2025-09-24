"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";

/* ---- data & helpers ---- */
type SkuRow = { sku: string; name: string; onHand: number; onOrder: number; dailySales: number; leadTimeDays: number; safetyDays: number; unitCost: number; };
const SKUS: SkuRow[] = [
  { sku: "SKU-A", name: "20W USB-C Wall Charger",      onHand: 1200, onOrder: 0,   dailySales: 85, leadTimeDays: 18, safetyDays: 7,  unitCost: 5.2 },
  { sku: "SKU-B", name: "2-Pack USB-C to USB-C Cable", onHand:  800, onOrder: 600, dailySales: 60, leadTimeDays: 14, safetyDays: 6,  unitCost: 2.1 },
  { sku: "SKU-C", name: "MagSafe Wireless Charger",    onHand:  300, onOrder: 0,   dailySales: 28, leadTimeDays: 30, safetyDays: 10, unitCost: 9.4 },
];

const STEPS = ["Plan","Pull Signals","Forecast","Constraints","Decision","Approval","Create PO & Log"] as const;
type StepId = (typeof STEPS)[number];

function fmt(n:number){ return Math.round(n).toLocaleString(); }
function money(n:number){ return "$"+n.toFixed(2); }
function recQty(r: SkuRow){ const cover=r.leadTimeDays+r.safetyDays; const need=r.dailySales*cover-(r.onHand+r.onOrder); return Math.max(0, Math.ceil(Math.max(0,need)/50)*50); }

/* ---- styles ---- */
const colors = { bg:"#ffffff", ink:"#111111", muted:"#6b7280", border:"#e5e7eb", card:"#ffffff", accent:"#1d4ed8", good:"#0a7f2e" } as const;
const styles: Record<string, React.CSSProperties> = {
  page:{ background:colors.bg, color:colors.ink, minHeight:"100vh", fontFamily:'Calibri, Arial, "Times New Roman", system-ui', lineHeight:1.35 },
  wrap:{ maxWidth:1120, margin:"24px auto", padding:"0 16px" },
  h1:{ fontSize:22, margin:0 }, sub:{ color:colors.muted, fontSize:14, margin:"2px 0 16px" },
  grid:{ display:"grid", gridTemplateColumns:"320px 1fr 320px", gap:16 },
  card:{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:12, padding:16 },
  section:{ fontSize:13, letterSpacing:".4px", color:"#374151", textTransform:"uppercase", margin:"0 0 12px" },
  table:{ width:"100%", borderCollapse:"collapse" }, th:{ fontSize:12, textAlign:"left", padding:"6px 8px", borderBottom:`1px solid ${colors.border}` }, td:{ fontSize:12, textAlign:"left", padding:"6px 8px", borderBottom:`1px solid ${colors.border}` },
  timeline:{ listStyle:"none", margin:0, padding:0 }, mono:{ fontFamily:'Consolas, "Courier New", monospace', fontSize:12, color:"#111", background:"#fff", border:`1px solid ${colors.border}`, borderRadius:8, padding:8, whiteSpace:"pre-wrap", overflow:"auto" },
  kpis:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }, kpi:{ padding:10, border:`1px solid ${colors.border}`, borderRadius:10, background:"#f9fafb" }, kpiGood:{ padding:10, border:`1px solid ${colors.border}`, borderRadius:10, background:"#f0fdf4" },
  kpiLabel:{ fontSize:12, color:colors.muted }, kpiValue:{ fontSize:18, marginTop:2 }, kpiValueGood:{ fontSize:18, marginTop:2, color:colors.good },
};
function btn(): React.CSSProperties { return { background: colors.accent, color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 600, outlineColor: "#93c5fd" }; }
function step(active:boolean, done:boolean){ return { display:"flex", gap:8, alignItems:"flex-start", padding:10, border:`1px solid ${colors.border}`, borderRadius:10, background:done?"#eef2ff":"#f9fafb", marginBottom:8, boxShadow:active?"inset 0 0 0 2px #bfdbfe":"none" } as React.CSSProperties;}
function bullet(active:boolean, done:boolean){ return { width:10, height:10, borderRadius:"50%", marginTop:6, background:done?colors.good:active?colors.accent:"#d1d5db", flex:"0 0 10px" } as React.CSSProperties;}

/* ---- component ---- */
export default function Page(){
  const [activeStep, setActiveStep] = useState<StepId | null>(null);
  const [started, setStarted] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [approved, setApproved] = useState(false);

  const proposals = useMemo(()=>SKUS.map(r=>{ const qty=recQty(r); const poValue=qty*r.unitCost; const daysOnHand=r.onHand/Math.max(1,r.dailySales); return { sku:r.sku,name:r.name,recommendedQty:qty,poValue,daysOnHand,rationale: qty===0?"Covered by on-hand + on-order":"Demand over lead time + safety exceeds inventory" }; }),[]);
  const [oosRisk,setOosRisk] = useState("9.8 percent"); const [invTurn,setInvTurn]=useState("8.2x"); const [fillRate,setFillRate]=useState("95.1 percent"); const [workingCap,setWorkingCap]=useState("$63,400");

  const receipt = useMemo(()=> approved ? JSON.stringify({ run_id:"A9-INV-2025-09-23-001", approved:true, approver:"OpsManager@demo", policy:{ min_days_on_hand:21, max_po_value_usd:50000, allow_partial:true }, purchase_orders: proposals.filter(p=>p.recommendedQty>0).map(p=>({ sku:p.sku, qty:p.recommendedQty, unit_cost: SKUS.find(s=>s.sku===p.sku)!.unitCost, value_usd: p.poValue })), rollback_token:"RBK-INV-7b12de", timestamp:new Date().toISOString() },null,2) : "{ pending }", [approved, proposals]);

  useEffect(()=>{ if(!started) return; let timer:number|undefined; const order:StepId[]=[...STEPS]; let idx=0;
    function advance(){ setActiveStep(order[idx]); if(order[idx]==="Approval") setCanApprove(true); idx+=1; if(idx<order.length){ timer=window.setTimeout(advance, 900); } }
    setActiveStep("Plan"); timer=window.setTimeout(advance,900); return ()=>{ if(timer) window.clearTimeout(timer); }; },[started]);

  function onStart(){ setStarted(true); setApproved(false); setCanApprove(false); setActiveStep(null); setOosRisk("9.8 percent"); setInvTurn("8.2x"); setFillRate("95.1 percent"); setWorkingCap("$63,400"); }
  function onApprove(){ setApproved(true); setCanApprove(false); setActiveStep("Create PO & Log"); setOosRisk("9.8 percent -> 4.7 percent"); setInvTurn("8.2x -> 8.5x"); setFillRate("95.1 percent -> 97.4 percent"); setWorkingCap("$63,400 -> $75,900"); }

  return (
    <div style={styles.page}>
      <Nav />
      <div style={styles.wrap}>
        <header style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
          <Image src="/aurora9-logo.jpg" alt="AURORA9 logo" width={200} height={48} priority style={{ height:36, width:"auto", objectFit:"contain" }} />
          <h1 style={styles.h1}>AURORA9 Inventory Agent Demo</h1>
        </header>
        <p style={styles.sub}>Seeded demo: forecasts demand, enforces constraints, proposes POs, awaits approval, then logs a receipt.</p>

        <div style={styles.grid}>
          <section style={styles.card}>
            <h2 style={styles.section}>Scenario</h2>
            <table style={styles.table}><thead><tr><th style={styles.th}>SKU</th><th style={styles.th}>On Hand</th><th style={styles.th}>On Order</th><th style={styles.th}>Daily Sales</th><th style={styles.th}>Lead Time</th></tr></thead>
              <tbody>{SKUS.map(r=>(
                <tr key={r.sku}><td style={styles.td}>{r.sku}</td><td style={styles.td}>{fmt(r.onHand)} units</td><td style={styles.td}>{fmt(r.onOrder)} units</td><td style={styles.td}>{fmt(r.dailySales)} /day</td><td style={styles.td}>{r.leadTimeDays} days</td></tr>
              ))}</tbody></table>

            <div style={{ marginTop:12, display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={onStart} disabled={started && !canApprove} style={btn()}>Start Demo</button>
              <button onClick={onApprove} disabled={!canApprove} style={btn()}>Approve POs</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <InlineNav current="inventory" />
            </div>
          </section>

          <section style={styles.card}>
            <h2 style={styles.section}>Agent Timeline</h2>
            <ul style={styles.timeline}>{STEPS.map(label=>{ const isActive=activeStep===label; const isDone=activeStep?STEPS.indexOf(label)<STEPS.indexOf(activeStep):false;
              return (<li key={label} style={step(isActive,isDone)}><div style={bullet(isActive,isDone)} /><div><strong>{label}</strong></div></li>); })}</ul>

            <h2 style={styles.section}>Proposed POs</h2>
            <pre style={styles.mono}>{started ? proposals.map(p=>`- ${p.sku} ${p.name}\n  • Days on hand: ${p.daysOnHand.toFixed(1)}\n  • Recommended qty: ${p.recommendedQty}\n  • Value: ${money(p.poValue)}\n  • Rationale: ${p.rationale}\n`).join("") : "{ pending }"}</pre>

            <h2 style={styles.section}>Governance Receipt</h2>
            <pre style={styles.mono}>{approved ? receipt : started ? "{ awaiting approval }" : "{ pending }"}</pre>
          </section>

          <section style={styles.card}>
            <h2 style={styles.section}>KPIs</h2>
            <div style={styles.kpis}>
              <div style={styles.kpi}><div style={styles.kpiLabel}>OOS Risk</div><div style={styles.kpiValue}>{oosRisk}</div></div>
              <div style={styles.kpi}><div style={styles.kpiLabel}>Inventory Turn</div><div style={styles.kpiValue}>{invTurn}</div></div>
              <div style={styles.kpi}><div style={styles.kpiLabel}>Fill Rate</div><div style={styles.kpiValue}>{fillRate}</div></div>
              <div style={styles.kpi}><div style={styles.kpiLabel}>Working Capital</div><div style={styles.kpiValue}>{workingCap}</div></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
