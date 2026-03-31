import { checkHeight } from "./styles";
import type { JsPdfDoc, MarkdownToPdfContext, PdfStyle } from "../types";

export function breakLine(doc: JsPdfDoc, distance: number, lastStyle: PdfStyle): PdfStyle {
  const style = { ...lastStyle };

  style.currentHeight += distance;
  style.cursorIndex = style.currentWidth;
  style.currentHeight = checkHeight(doc, style);

  return style;
}

export function lineBreak(this: MarkdownToPdfContext, distance: number): void {
  const style = breakLine(this.getDoc(), distance, this.getStyle());
  this.setStyle(style);
}

export function horizontalLine(this: MarkdownToPdfContext): void {
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
