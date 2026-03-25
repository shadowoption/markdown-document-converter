const docx = require("./docx");
const he = require("he");

// normalize text to prevent issues with non-string values and to extract text from objects if needed
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

// map markdown alignment to docx alignment
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

// create a table cell with the given text, alignment, and header status
function makeCell(self, text, align, isHeader) {
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
function processTable(token) {
  const paragraphs = this.getParagraphs();
  const rows = [];
  const headers = [];

  // write table headers
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

  // write table rows
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

  // create the table with the generated rows
  const table = new docx.Table({
    rows,
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
  });

  paragraphs.push(table);
  this.setParagraphs(paragraphs);
}

module.exports = { processTable };