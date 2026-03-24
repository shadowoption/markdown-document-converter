const docx = require("./docx");

function writeText(text) {
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

  this.current.push(new docx.TextRun(options));
}

module.exports = { writeText };