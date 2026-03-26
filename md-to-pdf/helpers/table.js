const { autoTable } = require("jspdf-autotable");

function processTable(token) {
  const doc = this.getDoc();
  const style = this.getStyle();
  const tableHeaders = token.header.map((header) => header.text);
  const tableData = token.rows.map((row) => {
    return tableHeaders.map((_, index) => ({
      content: row[index].text,
      styles: {
        halign: token.align[index] || "center",
      },
    }));
  });

  this.lineBreak(style.lineDistance);
  let nextStyle = { ...this.getStyle() };

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: nextStyle.currentHeight,
    tableWidth: nextStyle.maxLineWidth,
    pageBreak: "avoid",
    margin: nextStyle.currentWidth,
    didDrawPage: (data) => {
      nextStyle.currentHeight = data.cursor.y;
    },
  });

  this.setStyle(nextStyle);
  this.lineBreak(nextStyle.lineDistance);
}

module.exports = {
  processTable,
};
