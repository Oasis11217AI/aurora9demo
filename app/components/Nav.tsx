"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const bar: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  background: "#ffffff",
  borderBottom: "1px solid #e5e7eb",
};

const wrap: React.CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const brand: React.CSSProperties = {
  fontWeight: 800,
  letterSpacing: ".2px",
  fontSize: 14,
  color: "#111",
  whiteSpace: "nowrap",
};

const row: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" };

function tabStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 13,
    textDecoration: "none",
    color: active ? "#111" : "#374151",
    padding: "6px 10px",
    borderRadius: 999,
    border: active ? "1px solid #cbd5e1" : "1px solid transparent",
    background: active ? "#f1f5f9" : "transparent",
  };
}

export default function Nav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Governance" },
    { href: "/ads", label: "PPC / Bidding" },
    { href: "/inventory", label: "Inventory" },
    { href: "/compliance", label: "Compliance" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <div style={bar}>
      <div style={wrap}>
        <div style={brand}>AURORA9 Demos</div>
        <div style={row}>
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} style={tabStyle(pathname === t.href)}>
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
