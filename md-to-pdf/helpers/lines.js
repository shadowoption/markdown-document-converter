const { checkHeight } = require("./style");

function breakLine(doc, distance, lastStyle) {
  const style = { ...lastStyle };

  style.currentHeight += distance;
  style.cursorIndex = style.currentWidth;
  style.currentHeight = checkHeight(doc, style);

  return style;
}

function lineBreak(distance) {
  const style = breakLine(this.getDoc(), distance, this.getStyle());
  this.setStyle(style);
}

function horizontalLine() {
  const doc = this.getDoc();
  const style = this.getStyle();

  this.lineBreak(style.lineSpc);

  const current = this.getStyle();
  doc.line(
    current.currentWidth,
    current.currentHeight,
    current.maxLineWidth,
    current.currentHeight,
    "S"
  );

  this.lineBreak(current.lineSpc);
}

module.exports = {
  breakLine,
  lineBreak,
  horizontalLine,
};
