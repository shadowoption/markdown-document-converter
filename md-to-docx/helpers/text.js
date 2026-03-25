const docx = require("./docx");

function writeText(text) {
  const currentTextRuns = this.getCurrentTextRuns();
  const options = {
    text: text,
    font: this.style.font,
    bold: this.style.bold,
  };
  if (!this.style.headingLevel) {
    options.size = this.style.fontSize;
    options.color = this.style.textColor;
    options.italics = this.style.italics;
    options.strike = this.style.strike;
  }
  if (this.style.link) {
    options.style = "Hyperlink";
  }

  currentTextRuns.push(new docx.TextRun(options));
  this.setCurrentTextRuns(currentTextRuns);
}

module.exports = { writeText };