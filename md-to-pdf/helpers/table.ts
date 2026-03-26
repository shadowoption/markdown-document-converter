const { autoTable } = require("jspdf-autotable");

import type { MarkdownTableToken, MarkdownToPdfContext } from "../types";

export function processTable(this: MarkdownToPdfContext, token: MarkdownTableToken): void {
  const doc = this.getDoc();
  const style = this.getStyle();
  const tableHeaders = token.header.map((header: any) => header.text);
  const tableData = token.rows.map((row: any[]) => {
    return tableHeaders.map((_: string, index: number) => ({
      content: row[index].text,
      styles: {
        halign: token.align[index] || "center",
      },
    }));
  });

  this.lineBreak(style.lineDistance);
  const nextStyle = { ...this.getStyle() };

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: nextStyle.currentHeight,
    tableWidth: nextStyle.maxLineWidth,
    pageBreak: "avoid",
    margin: nextStyle.currentWidth,
    didDrawPage: (data: any) => {
      nextStyle.currentHeight = data.cursor.y;
    },
  });

  this.setStyle(nextStyle);
  this.lineBreak(nextStyle.lineDistance);
}
