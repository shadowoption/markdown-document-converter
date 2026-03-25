import docx = require("./docx");
import he from "he";
import type { DocxAlignment, MarkdownTableToken, MarkdownToDocxContext } from "../types";

type CellInput = MarkdownTableToken["header"][number] | string | number | null | undefined;

// normalize text to prevent issues with non-string values and to extract text from objects if needed
function normalizeText(value: CellInput): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && typeof value.text === "string") {
    return value.text;
  }
  return String(value);
}

// map markdown alignment to docx alignment
function mapAlign(align?: MarkdownTableToken["align"][number]): DocxAlignment | undefined {
  switch (align) {
    case "left":
      return docx.AlignmentType.LEFT;
    case "right":
      return docx.AlignmentType.RIGHT;
    case "center":
      return docx.AlignmentType.CENTER;
    default:
      return undefined;
  }
}

// create a table cell with the given text, alignment, and header status
function makeCell(
  self: MarkdownToDocxContext,
  text: CellInput,
  align: DocxAlignment | undefined,
  isHeader: boolean,
): import("docx").TableCell {
  const normalized = normalizeText(text);
  const decoded = he.decode(normalized);

  return new docx.TableCell({
    children: [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: decoded || "",
            bold: isHeader,
            size: self.style.fontSize,
            font: self.style.font,
            color: self.style.textColor,
          }),
        ],
        alignment: align,
      }),
    ],
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });
}

// process a markdown table token and convert it to a docx table
export function processTable(this: MarkdownToDocxContext, token: MarkdownTableToken): void {
  const paragraphs = this.getParagraphs();
  const rows: import("docx").TableRow[] = [];
  const headers: import("docx").TableCell[] = [];
  const headerCells = token.header || [];
  const alignments = token.align || [];

  // write table headers
  for (let i = 0; i < headerCells.length; i++) {
    const headerValue = headerCells[i];
    headers.push(makeCell(this, headerValue, mapAlign(alignments[i]), true));
  }

  rows.push(
    new docx.TableRow({
      children: headers,
      tableHeader: true,
    }),
  );

  // write table rows
  for (const row of token.rows || []) {
    const currentRow: import("docx").TableCell[] = [];
    for (let i = 0; i < headerCells.length; i++) {
      const cell = row[i] || { text: "", tokens: [], header: false, align: null };
      currentRow.push(makeCell(this, cell, mapAlign(alignments[i]), false));
    }
    rows.push(
      new docx.TableRow({
        children: currentRow,
      }),
    );
  }

  // create the table with the generated rows
  const table = new docx.Table({
    rows,
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
  });

  paragraphs.push(table);
  this.setParagraphs(paragraphs);
}
