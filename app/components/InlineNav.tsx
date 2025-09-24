"use client";

import Link from "next/link";

type Current = "governance" | "ads" | "inventory" | "compliance" | "pricing";

export default function InlineNav({ current }: { current: Current }) {
  const tabs = [
    { href: "/", label: "Governance", key: "governance" as const },
    { href: "/ads", label: "PPC / Bidding", key: "ads" as const },
    { href: "/inventory", label: "Inventory", key: "inventory" as const },
    { href: "/compliance", label: "Compliance", key: "compliance" as const },
    { href: "/pricing", label: "Pricing", key: "pricing" as const },
  ];

  const wrap: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
  const pill = (active: boolean): React.CSSProperties => ({
    fontSize: 12,
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: 999,
    border: active ? "1px solid #cbd5e1" : "1px solid #e5e7eb",
    background: active ? "#f1f5f9" : "#ffffff",
    color: active ? "#111111" : "#374151",
  });

  return (
    <div style={wrap} aria-label="Inline page navigation">
      {tabs.map(t => (
        <Link key={t.key} href={t.href} style={pill(current === t.key)}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
