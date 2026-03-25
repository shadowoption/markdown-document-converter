const docx = require("./docx");

function horizontalLine() {
  const paragraphs = this.getParagraphs();
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
  paragraphs.push(
    new docx.Paragraph(options),
  );
  this.setParagraphs(paragraphs);
}

function breakLine() {
  const current = this.getCurrent();
  const options = {
    text: "",
    size: this.style.fontSize,
    break: 1,
  }
  current.push(
    new docx.TextRun(options),
  );
  this.setCurrent(current);
}

module.exports = { horizontalLine, breakLine };