 "use client";

import React from "react";
import { downloadCSV, downloadJSON } from "./ExportUtils";

type Props = {
  heading: string;
  /** Human-readable explanation shown in the first accordion */
  detailsText?: string;
  /** Technical payload (shown only when toggled) */
  techData?: unknown;
  /** Optional rows for CSV export */
  csvRows?: Array<Record<string, unknown>>;
  /** Base file name for downloads (no extension) */
  fileBase: string;
  /** Optional reset handler */
  onReset?: () => void;
  /** Button copy variant — use "receipt" to show Download Receipt (.json) */
  variant?: "default" | "receipt";
};

/** One-time A/B label pick (“Show details” vs “View breakdown”) persisted in localStorage. */
function useDetailsLabel(): string {
  const KEY = "a9_ab_details_label";
  const [label, setLabel] = React.useState("Show details");
  React.useEffect(() => {
    const existing = localStorage.getItem(KEY);
    if (existing) { setLabel(existing); return; }
    const pick = Math.random() < 0.5 ? "Show details" : "View breakdown";
    localStorage.setItem(KEY, pick);
    setLabel(pick);
  }, []);
  return label;
}

export default function DetailsPanel({
  heading,
  detailsText,
  techData,
  csvRows,
  fileBase,
  onReset,
  variant = "default",
}: Props) {
  const [openDetails, setOpenDetails] = React.useState(false);
  const [openTech, setOpenTech] = React.useState(false);
  const detailsLabel = useDetailsLabel();

  const styles: Record<string, React.CSSProperties> = {
    card: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff" },
    title: { fontSize: 13, letterSpacing: ".3px", color: "#374151", textTransform: "uppercase", margin: "0 0 8px" },
    toolbar: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 },
    btn: { background: "#1d4ed8", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 600 } as React.CSSProperties,
    btnGhost: { background: "#f3f4f6", color: "#111", border: "1px solid #e5e7eb", padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 600 } as React.CSSProperties,
    pre: { fontFamily: 'Consolas, "Courier New", monospace', fontSize: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, whiteSpace: "pre-wrap", overflow: "auto" },
  };

  const techButtonCopy = variant === "receipt" ? "Download Receipt (.json)" : "Download technical format (JSON)";

  return (
    <section style={styles.card}>
      <h3 style={styles.title}>{heading}</h3>

      <div style={styles.toolbar}>
        {csvRows && csvRows.length > 0 && (
          <button type="button" style={styles.btnGhost} onClick={() => downloadCSV(fileBase, csvRows)}>
            Download CSV
          </button>
        )}
        {techData !== undefined && (
          <button type="button" style={styles.btnGhost} onClick={() => downloadJSON(fileBase, techData)}>
            {techButtonCopy}
          </button>
        )}
        {onReset && (
          <button type="button" style={styles.btnGhost} onClick={onReset}>
            Reset
          </button>
        )}
        {detailsText && (
          <button type="button" style={styles.btn} onClick={() => setOpenDetails(v => !v)}>
            {openDetails ? "Hide details" : detailsLabel}
          </button>
        )}
        {techData !== undefined && (
          <button type="button" style={styles.btn} onClick={() => setOpenTech(v => !v)}>
            {openTech ? "Hide technical format" : "Show technical format (JSON)"}
          </button>
        )}
      </div>

      {openDetails && detailsText && <pre style={styles.pre}>{detailsText}</pre>}
      {openTech && techData !== undefined && (
        <pre style={styles.pre}>{JSON.stringify(techData, null, 2)}</pre>
      )}
    </section>
  );
}
