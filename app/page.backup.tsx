"use client";
import { useState } from "react";
import Nav from "./components/Nav";
import DetailsPanel from "./components/DetailsPanel";

export default function Home() {
  const [receipt, setReceipt] = useState({
    runId: "gov-demo-001",
    status: "Draft",
    policyPack: "Default Governance Pack",
    approvals: [] as Array<{ step: string; at: string }>,
    createdAt: new Date().toISOString(),
  });

  const resetReceipt = () =>
    setReceipt({
      runId: "gov-demo-001",
      status: "Draft",
      policyPack: "Default Governance Pack",
      approvals: [],
      createdAt: new Date().toISOString(),
    });

  const wrap: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", padding: "32px 16px 64px" };
  const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 };
  const card: React.CSSProperties = { border: "1px solid #eee", borderRadius: 12, background: "#fff", padding: 16 };

  return (
    <>
      <Nav />
      <main style={wrap}>
        <h1 style={{ margin: 0, fontSize: 28 }}>AURORA9 Governance Demo</h1>
        <p style={{ marginTop: 8, color: "#4b4b4b" }}>
          Governance-only scaffold. Use the buttons to simulate steps, then download the receipt.
        </p>

        <section style={grid}>
          {/* Controls Timeline (governance only) */}
          <div style={card}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Controls Timeline</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <button style={btn()} onClick={() => setReceipt(r => ({ ...r, status: "Policies Loaded" }))}>
                Load Policy Pack
              </button>
              <button style={btn()} onClick={() => setReceipt(r => ({ ...r, status: "Guardrails Applied" }))}>
                Apply Guardrails
              </button>
              <button style={btn()} onClick={() => setReceipt(r => ({ ...r, approvals: [...r.approvals, { step: "Approval Checkpoint", at: new Date().toISOString() }] }))}>
                Approval Checkpoint
              </button>
              <button style={btn()} onClick={() => setReceipt(r => ({ ...r, status: "Logged & Immutable" }))}>
                Log Immutable Receipt
              </button>
            </div>
          </div>

          {/* Governance Receipt (download + details) */}
          <div>
            <DetailsPanel
              heading="Governance Receipt"
              detailsText="This is a governance-only demo receipt. Use the buttons to simulate steps, then download as JSON."
              techData={receipt}
              fileBase="governance_receipt"
              onReset={resetReceipt}
              variant="receipt"
            />
          </div>
        </section>
      </main>
    </>
  );

  function btn(): React.CSSProperties {
    return {
      background: "#1d4ed8",
      color: "#fff",
      border: "none",
      padding: "10px 12px",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: 600,
      width: "100%",
    };
  }
}