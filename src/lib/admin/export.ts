import ExcelJS from "exceljs";

/** Neutralises spreadsheet formula injection (CSV/Excel injection — OWASP). */
function safeCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

export function toCsv(headers: string[], rows: unknown[][]) {
  const esc = (v: unknown) => `"${safeCell(v).replace(/"/g, '""')}"`;
  return "﻿" + [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
}

export async function toXlsx(sheet: string, headers: string[], rows: unknown[][]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Nuvsera Admin";
  const ws = wb.addWorksheet(sheet);
  ws.addRow(headers).font = { bold: true };
  rows.forEach((r) => ws.addRow(r.map(safeCell)));
  ws.columns.forEach((c) => (c.width = 22));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export function download(body: string | Buffer, filename: string, type: "csv" | "xlsx") {
  return new Response(typeof body === "string" ? body : new Uint8Array(body), {
    headers: {
      "content-type": type === "csv" ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    },
  });
}
