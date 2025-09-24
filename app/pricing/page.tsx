"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Nav from "../components/Nav";
import InlineNav from "../components/InlineNav";

type TierId = "freemium" | "standard" | "enterprise" | "custom";

type Feature = {
  text: string;
  included: boolean;
  note?: string;
};

type Tier = {
  id: TierId;
  name: string;
  blurb: string;
  monthly: number; // 0 for free; custom uses 0 but is "Contact us"
  yearlyDiscountPct: number; // applied to monthly * 12
  features: Feature[];
  cta: string;
  highlight?: boolean;
};

const colors = {
  bg: "#ffffff",
  ink: "#111111",
  muted: "#6b7280",
  border: "#e5e7eb",
  card: "#ffffff",
  accent: "#1d4ed8",
  good: "#0a7f2e",
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
  switcher: {
    display: "inline-flex",
    gap: 6,
    alignItems: "center",
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    padding: 4,
    background: "#f9fafb",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginTop: 16,
  } as React.CSSProperties,
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tierName: { fontSize: 16, fontWeight: 700, margin: 0 },
  blurb: { color: colors.muted, fontSize: 13, margin: "4px 0 12px" },
  price: { fontSize: 28, fontWeight: 800, margin: "6px 0" },
  small: { color: colors.muted, fontSize: 12 },
  ul: { margin: "10px 0 0 16px", padding: 0, fontSize: 13 },
  li: { margin: "6px 0" },
  cta: {
    marginTop: 12,
    background: colors.accent,
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    width: "100%",
  },
  badge: {
    display: "inline-block",
    border: `1px solid ${colors.border}`,
    background: "#eef2ff",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    marginLeft: 8,
  },
};

// ✅ Standalone function (not inside styles)
function switchBtn(active: boolean): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    border: "none",
    background: active ? "#ffffff" : "transparent",
    boxShadow: active ? "inset 0 0 0 1px #e5e7eb" : "none",
    fontWeight: 600,
    cursor: "pointer",
  };
}

function yearlyPrice(monthly: number, discountPct: number): number {
  const base = monthly * 12;
  const discount = base * (discountPct / 100);
  return Math.round((base - discount) * 100) / 100;
}

const TIERS: Tier[] = [
  {
    id: "freemium",
    name: "Freemium",
    blurb: "Try AURORA9 agents free for 30 days.",
    monthly: 0,
    yearlyDiscountPct: 0,
    cta: "Start 30-day Free Trial",
    features: [
      { text: "Up to 1,000 actions/month across all agents", included: true },
      { text: "Ads Governance demo (propose + approve)", included: true },
      { text: "Inventory demo (seeded data)", included: true },
      { text: "Basic policy pack & audit log", included: true },
      { text: "Slack/email notifications", included: true },
      { text: "PPC bid automation", included: false, note: "Standard+" },
      { text: "ERP/WMS connectors", included: false, note: "Enterprise+" },
      { text: "Custom guardrails", included: false, note: "Enterprise+" },
      { text: "Dedicated success manager", included: false, note: "Custom" },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    blurb: "Autonomous PPC + governance for growing brands.",
    monthly: 799,
    yearlyDiscountPct: 15,
    cta: "Start Standard",
    highlight: true,
    features: [
      { text: "Up to 50,000 actions/month", included: true },
      { text: "PPC bidding + negatives + budget moves", included: true },
      { text: "Inventory POs with approval", included: true },
      { text: "Policy bands & rollback tokens", included: true },
      { text: "Basic connectors (Amazon Ads & Seller Central)", included: true },
      { text: "ERP/WMS connectors", included: false, note: "Enterprise+" },
      { text: "SOC2 report & single-tenant option", included: false, note: "Enterprise+" },
      { text: "SLA 99.9%", included: false, note: "Enterprise+" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    blurb: "Scaled agent workforce with deep integrations.",
    monthly: 2499,
    yearlyDiscountPct: 20,
    cta: "Contact Sales",
    features: [
      { text: "Up to 500,000 actions/month", included: true },
      { text: "ERP/WMS/BI integrations", included: true },
      { text: "Custom guardrails & approval workflows", included: true },
      { text: "watsonx.governance alignment & model cards", included: true },
      { text: "SSO + RBAC + audit exports", included: true },
      { text: "Dedicated VPC / single-tenant optional", included: true },
      { text: "SLA 99.95% + priority support", included: true },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    blurb: "Usage-based or outcome-based pricing.",
    monthly: 0,
    yearlyDiscountPct: 0,
    cta: "Design Your Plan",
    features: [
      { text: "Unlimited actions (metered)", included: true },
      { text: "Outcome pricing (per order / per $ revenue)", included: true },
      { text: "Hybrid agent + human ops", included: true },
      { text: "Private model hosting & KMS", included: true },
      { text: "Co-development & white-glove onboarding", included: true },
    ],
  },
];

export default function Page() {
  const [billYearly, setBillYearly] = useState<boolean>(false);

  const priced = useMemo(() => {
    return TIERS.map((t) => {
      if (t.id === "custom" || t.id === "freemium") return t;
      const annual = yearlyPrice(t.monthly, t.yearlyDiscountPct);
      return { ...t, annual } as Tier & { annual: number };
    });
  }, []);

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
          <h1 style={styles.h1}>AURORA9 Subscription Pricing</h1>
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            Seeded preview
          </span>
        </header>
        <p style={styles.sub}>
          Modeled after agentic-AI pricing patterns (capacity-based + governance).
          Choose monthly or save with annual billing.
        </p>

        {/* Billing toggle */}
        <div style={{ marginTop: 6 }}>
          <div style={styles.switcher}>
            <button
              type="button"
              onClick={() => setBillYearly(false)}
              style={switchBtn(!billYearly)}
            >
              Billed Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillYearly(true)}
              style={switchBtn(billYearly)}
            >
              Billed Yearly <span style={styles.badge}>save 15–20%</span>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div style={styles.grid}>
          {priced.map((t) => {
            const isCustom = t.id === "custom";
            const isFree = t.id === "freemium";
            const price =
              isCustom
                ? "Contact us"
                : isFree
                ? "$0"
                : billYearly && "annual" in t
                ? `$${(t as unknown as { annual: number }).annual.toLocaleString()} /yr`
                : `$${t.monthly.toLocaleString()} /mo`;

            return (
              <article
                key={t.id}
                style={{
                  ...styles.card,
                  boxShadow: t.highlight ? "0 0 0 2px #bfdbfe" : "none",
                }}
              >
                <div>
                  <h3 style={styles.tierName}>
                    {t.name}
                    {t.highlight && <span style={styles.badge}>Most popular</span>}
                  </h3>
                  <p style={styles.blurb}>{t.blurb}</p>
                  <div style={styles.price}>{price}</div>
                  {!isCustom && !isFree && billYearly && (
                    <div style={styles.small}>
                      {t.monthly.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}{" "}
                      /mo equivalent
                    </div>
                  )}
                  {isFree && (
                    <div style={styles.small}>Free for 30 days, then choose a plan.</div>
                  )}

                  <ul style={styles.ul}>
                    {t.features.map((f, i) => (
                      <li key={i} style={styles.li}>
                        {f.included ? "✅ " : "— "}
                        {f.text}
                        {f.note && (
                          <span style={{ color: colors.muted }}> ({f.note})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <button style={styles.cta}>{t.cta}</button>
              </article>
            );
          })}
        </div>

        {/* Consistent inline nav at bottom */}
        <div style={{ marginTop: 14 }}>
          <InlineNav current="pricing" />
        </div>
      </div>
    </div>
  );
}
