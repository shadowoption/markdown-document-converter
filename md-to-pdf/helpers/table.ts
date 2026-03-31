const { autoTable } = require("jspdf-autotable");

import type { MarkdownTableToken, MarkdownToPdfContext } from "../types";

type CellInput = MarkdownTableToken["header"][number] | string | number | null | undefined;

function normalizeText(value: CellInput): string {
  // Marked table cells may arrive as strings, token-like objects, or scalar values.
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && "text" in value && typeof value.text === "string") {
    return value.text;
  }
  return String(value);
}

export function processTable(this: MarkdownToPdfContext, token: MarkdownTableToken): void {
  const doc = this.getDoc();
  const style = this.getStyle();
  // write table headers
  const tableHeaders = token.header.map((header) => normalizeText(header));
  // write table rows
  const tableData = token.rows.map((row) => {
    return tableHeaders.map((_: string, index: number) => ({
      content: normalizeText(row[index]),
      styles: {
        // Keep existing behavior: default to centered text when alignment is absent.
        halign: token.align[index] || "center",
      },
    }));
  });

  this.lineBreak(style.lineDistance);
  const nextStyle = { ...this.getStyle() };

  // create the table with the generated rows
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: nextStyle.currentHeight,
    tableWidth: nextStyle.maxLineWidth,
    pageBreak: "avoid",
    margin: nextStyle.currentWidth,
    didDrawPage: (data: any) => {
      // Sync our cursor with autoTable's internal cursor across page breaks.
      nextStyle.currentHeight = data.cursor.y;
    },
  });

  // update cursor position after table rendering
  this.setStyle(nextStyle);
  this.lineBreak(nextStyle.lineDistance);
}
