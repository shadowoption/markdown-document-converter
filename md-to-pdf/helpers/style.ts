let jspdfFonts: { chooseFontForText: (text: string) => string };

try {
  jspdfFonts = require("../../../assets/js/jspdfFonts.js");
} catch (error) {
  jspdfFonts = {
    chooseFontForText() {
      return "helvetica";
    },
  };
}

import type { JsPdfDoc, MarkdownToPdfContext, PdfStyle } from "../types";

export function getDefaultStyle(overrides: Partial<PdfStyle> = {}): PdfStyle {
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
    drawColor: "#333333",
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

export function pushStyle(this: MarkdownToPdfContext): void {
  // push the current style onto the stack
  const styleStack = this.getStyleStack().slice();
  styleStack.push({ ...this.getStyle() });
  this.setStyleStack(styleStack);
}

export function popStyle(this: MarkdownToPdfContext): void {
  // pop the last style from the stack and set it as the current style
  const current = this.getStyle();
  const styleStack = this.getStyleStack().slice();
  if (styleStack.length === 0) {
    throw new Error("Style stack underflow: no styles to pop");
  }

  const style = styleStack.pop() as PdfStyle;
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

export function updateStyle(this: MarkdownToPdfContext, partial: Partial<PdfStyle> = {}): void {
  // update the current style with the given partial style
  this.setStyle({
    ...this.getStyle(),
    ...partial,
  });
}

export function setTextStyle(this: MarkdownToPdfContext, type: string): void {
  // set text style based on the given type (e.g., "strong", "em", "del")
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

export function checkHeight(doc: JsPdfDoc, style: PdfStyle): number {
  if (style.currentHeight + style.lineSpc > style.pageHeight) {
    doc.addPage();
    return style.startHeight;
  }

  return style.currentHeight;
}

export function setDocStyle(doc: JsPdfDoc, text: string, style: PdfStyle): void {
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
