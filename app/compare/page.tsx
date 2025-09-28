"use client";
import { useState } from "react";
import Nav from "../components/Nav";
import ComparisonDetails from "../components/ComparisonDetails";

type Tab = "Overview" | "Side-by-Side" | "Ratings";

export default function ComparePage() {
  const [tab, setTab] = useState<Tab>("Overview");

  const wrap: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "32px 16px 64px",
    fontFamily: 'Calibri, Arial, "Times New Roman", system-ui',
    color: "#0f0f0f",
  };

  const hero: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 28,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
    marginBottom: 20,
  };

  const tabsBar: React.CSSProperties = { display: "flex", gap: 8, marginTop: 14 };
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    background: active ? "#f5f5f7" : "#fff",
    cursor: "pointer",
    fontSize: 14,
  });

  const card: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 20,
    background: "#fff",
  };

  return (
    <>
      <Nav />
      <main style={wrap}>
        <header style={hero}>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
            Amazon AI Tools vs. AURORA9 Autonomous Agents
          </h1>
          <p style={{ marginTop: 8, color: "#4b4b4b", fontSize: 16 }}>
            Minimalist layout with tabs for clarity. Start with a concise overview, then dive into the full side-by-side.
          </p>

          <div style={tabsBar} role="tablist" aria-label="Comparison views">
            {(["Overview", "Side-by-Side", "Ratings"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                style={tabBtn(tab === t)}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {tab === "Overview" && (
          <section style={card}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Key distinctions</h2>
            <ul style={{ margin: "8px 0 0 18px", lineHeight: 1.6 }}>
              <li><strong>Operation mode:</strong> Amazon tools assist humans, AURORA9 runs autonomous loops with receipts and approvals.</li>
              <li><strong>Governance:</strong> AURORA9 adds policy guardrails, audit trails, explainability, and change logs across PPC, pricing, inventory, and compliance.</li>
              <li><strong>Scale & orchestration:</strong> AURORA9 coordinates safe, reversible changes across functions with cross-tool logic.</li>
            </ul>
          </section>
        )}

        {tab === "Side-by-Side" && (
          <section style={{ ...card, overflow: "hidden" }}>
            <ComparisonDetails />
          </section>
        )}

        {tab === "Ratings" && (
          <section style={card}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Quick star view</h2>
            <ul style={{ margin: "8px 0 0 18px", lineHeight: 1.6 }}>
              <li>Search analytics: Amazon ★★★★☆, AURORA9 ★★★★★</li>
              <li>Autonomy loops: Amazon ★★☆☆☆, AURORA9 ★★★★★</li>
              <li>Governance & receipts: Amazon ★★☆☆☆, AURORA9 ★★★★★</li>
              <li>Cross-tool orchestration: Amazon ★★☆☆☆, AURORA9 ★★★★★</li>
            </ul>
            <p style={{ marginTop: 12, color: "#6b6b6b", fontSize: 13 }}>
              Note: Stars summarize scope and maturity for demo purposes.
            </p>
          </section>
        )}
      </main>
    </>
  );
}