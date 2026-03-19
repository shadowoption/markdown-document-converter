const docx = require("docx");
const he = require("he");

function normalizeText(value) {
  if(value === null || value === undefined) {
    return "";
  }
  if(typeof value === "string") {
    return value;
  }
  if(typeof value === "object" && typeof value.text === "string") {
    return value.text;
  }
  return String(value);
}

function mapAlign(align) {
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

function makeCell(self, text, align, isHeader) {
  return new docx.TableCell({
    children: [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: he.decode(normalizeText(text)) || "",
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

function processTable(token) {
  const rows = [];
  const headers = [];

  for (let i = 0; i < token.header.length; i++) {
    const h = token.header[i];
    headers.push(
      makeCell(this, h, mapAlign(token.align[i]), true),
    );
  }

  rows.push(
    new docx.TableRow({
      children: headers,
      tableHeader: true,
    }),
  );

  for (const r of token.rows) {
    const currentRow = [];
    for (let i = 0; i < token.header.length; i++) {
      const cell = r[i] || { text: "" };
      currentRow.push(
        makeCell(this, cell, mapAlign(token.align[i]), false),
      );
    }
    rows.push(
      new docx.TableRow({
        children: currentRow,
      }),
    );
  }

  const table = new docx.Table({
    rows,
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
  });

  this.paragraphs.push(table);
}

module.exports = { processTable };