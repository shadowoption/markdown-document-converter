import { checkHeight } from "./style";
import type { MarkdownCheckboxToken, MarkdownListItemToken, MarkdownToPdfContext, PdfStyle } from "../types";

export function writePrefix(
  this: MarkdownToPdfContext,
  token: MarkdownListItemToken | MarkdownCheckboxToken
): PdfStyle {
  let style = this.getStyle();

  if (token.prefix) {
    style = this.writeText(String(token.prefix || ""));
  }

  return style;
}

export function writeText(this: MarkdownToPdfContext, text: string): PdfStyle {
  text = String(text || "");
  const doc = this.getDoc();
  const lastStyle = this.getStyle();
  const style = { ...lastStyle };

  this.setDocStyle(doc, text, style);
  const splitText = doc.splitTextToSize(text, style.maxLineWidth);

  for (const piece of splitText) {
    if (style.cursorIndex + doc.getTextWidth(piece) > style.maxLineWidth) {
      style.currentHeight += style.lineSpc;
      style.cursorIndex = style.currentWidth;
    }

    style.currentHeight = checkHeight(doc, style);
    this.setDocStyle(doc, piece, style);

    if (style.link) {
      doc.textWithLink(piece, style.cursorIndex, style.currentHeight, {
        url: style.link,
      });
    } else {
      doc.text(piece, style.cursorIndex, style.currentHeight);
    }

    if (style.strike) {
      doc.line(
        style.cursorIndex,
        style.currentHeight - 0.25 * style.fontSize,
        style.cursorIndex + doc.getTextWidth(piece),
        style.currentHeight - 0.25 * style.fontSize,
        "S"
      );
    }

    style.cursorIndex += doc.getTextWidth(piece);
  }

  this.setStyle(style);

  return style;
}
