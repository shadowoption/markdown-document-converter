const docx = require("docx");

function getOptions(text, style) {
  const options = {
    text,
    font: style.font,
    bold: style.bold,
  };
  if (!style.headingLevel) {
    options.size = style.fontSize;
    options.color = style.textColor;
    options.italics = style.italics;
    options.strike = style.strike;
  }
  if (style.link) {
    options.style = "Hyperlink";
  }
  return options;
}

function writeText(text) {
  this.current.push(new docx.TextRun(getOptions(text, this.style)));
}

module.exports = { writeText };