// app/components/Nav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const link = {
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 14,
  textDecoration: "none",
  color: "#111",
};
const active = { background: "#f2f2f2" };

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "flex",
          gap: 12,
          alignItems: "center",
          padding: "12px 16px",
          fontFamily: 'Calibri, Arial, "Times New Roman", system-ui',
        }}
      >
        <Link href="/" style={{ ...link, ...(pathname === "/" ? active : {}) }}>
          Governance
        </Link>
        <Link href="/ads" style={{ ...link, ...(pathname === "/ads" ? active : {}) }}>
          PPC / Bidding
        </Link>
        <Link href="/inventory" style={{ ...link, ...(pathname === "/inventory" ? active : {}) }}>
          Inventory
        </Link>
        <Link href="/compliance" style={{ ...link, ...(pathname === "/compliance" ? active : {}) }}>
          Compliance
        </Link>
        <Link href="/pricing" style={{ ...link, ...(pathname === "/pricing" ? active : {}) }}>
          Pricing
        </Link>
        <Link href="/compare" style={{ ...link, ...(pathname === "/compare" ? active : {}) }}>
          Compare
        </Link>
      </div>
    </nav>
  );
}
