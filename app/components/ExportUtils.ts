"use client";

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSVValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return '"' + String(JSON.stringify(v)).replace(/"/g, '""') + '"';
  const s = String(v);
  return /[,"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows || rows.length === 0) return;
  const headers = Array.from(rows.reduce((acc, r) => { Object.keys(r).forEach(k => acc.add(k)); return acc; }, new Set<string>()));
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => toCSVValue(r[h])).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
