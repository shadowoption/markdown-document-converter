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

function lineBreak() {
  const currentTextRuns = this.getCurrentTextRuns();
  const options = {
    text: "",
    size: this.style.fontSize,
    break: 1,
  }
  currentTextRuns.push(
    new docx.TextRun(options),
  );
  this.setCurrentTextRuns(currentTextRuns);
}

module.exports = { horizontalLine, lineBreak };