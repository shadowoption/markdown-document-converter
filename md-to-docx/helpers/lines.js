const docx = require("docx");

function horizontalLine() {
  const options = {
    border: {
      bottom: {
        color: this.style.blockColor,
        space: 1,
        style: "single",
        size: 6,
      },
    },
  }
  this.paragraphs.push(
    new docx.Paragraph(options),
  );
}

function breakLine() {
  const options = {
    text: "",
    size: this.style.fontSize,
    break: 1,
  }
  this.current.push(
    new docx.TextRun(options),
  );
}

module.exports = { horizontalLine, breakLine };