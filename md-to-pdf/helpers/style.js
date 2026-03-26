let jspdfFonts;

try {
  jspdfFonts = require("../../../assets/js/jspdfFonts.js");
} catch (error) {
  jspdfFonts = {
    chooseFontForText() {
      return "helvetica";
    },
  };
}

function getDefaultStyle(overrides = {}) {
  return {
    font: null,
    lineDistance: 10,
    startWidth: 60,
    startHeight: 70,
    indent: 8,
    blockColor: "#858585",
    currentWidth: 60,
    currentHeight: 70,
    cursorIndex: 60,
    fontSize: 10,
    textColor: "#333333",
    linkColor: "#0000EE",
    drawColor: "#000000",
    lineSpc: 18,
    maxLineWidth: 500,
    pageHeight: 780,
    bold: false,
    italics: false,
    strike: false,
    code: false,
    link: null,
    skipParagraphBreak: false,
    ...overrides,
  };
}

function pushStyle() {
  const styleStack = this.getStyleStack().slice();
  styleStack.push({ ...this.getStyle() });
  this.setStyleStack(styleStack);
}

function popStyle() {
  const current = this.getStyle();
  const styleStack = this.getStyleStack().slice();
  if (styleStack.length === 0) {
    throw new Error("Style stack underflow: no styles to pop");
  }

  const style = styleStack.pop();
  this.setStyleStack(styleStack);
  this.setStyle({
    ...style,
    currentWidth: current.currentWidth,
    currentHeight: current.currentHeight,
    cursorIndex: current.cursorIndex,
    lineDistance: current.lineDistance,
    lineSpc: current.lineSpc,
    startWidth: current.startWidth,
    startHeight: current.startHeight,
    maxLineWidth: current.maxLineWidth,
    pageHeight: current.pageHeight,
    skipParagraphBreak: current.skipParagraphBreak,
  });
}

function updateStyle(partial = {}) {
  const normalized = { ...partial };

  if (Object.hasOwn(normalized, "italic") && !Object.hasOwn(normalized, "italics")) {
    normalized.italics = normalized.italic;
  }
  if (Object.hasOwn(normalized, "italics") && !Object.hasOwn(normalized, "italic")) {
    normalized.italic = normalized.italics;
  }

  this.setStyle({
    ...this.getStyle(),
    ...normalized,
  });
}

function setTextStyle(type) {
  switch (type) {
    case "strong":
      this.updateStyle({ bold: true });
      break;
    case "em":
      this.updateStyle({ italics: true });
      break;
    case "del":
      this.updateStyle({ strike: true, drawColor: this.getStyle().textColor });
      break;
    default:
      break;
  }
}

function checkHeight(doc, style) {
  if (style.currentHeight + style.lineSpc > style.pageHeight) {
    doc.addPage();
    return style.startHeight;
  }

  return style.currentHeight;
}

function setDocStyle(doc, text, style) {
  const font = style.code ? "courier" : style.font || jspdfFonts.chooseFontForText(text);

  doc.setFont(font);
  doc.setFontSize(style.fontSize);
  doc.setTextColor(style.textColor);
  doc.setDrawColor(style.drawColor);

  if (style.bold && style.italics) {
    doc.setFont(font, "bolditalic");
  } else if (style.bold) {
    doc.setFont(font, "bold");
  } else if (style.italics) {
    doc.setFont(font, "italic");
  } else {
    doc.setFont(font, "normal");
  }
}

module.exports = {
  getDefaultStyle,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
  checkHeight,
  setDocStyle,
};
