import { checkHeight } from "./styles";
import type {
  MarkdownCheckboxToken,
  MarkdownListItemToken,
  MarkdownToPdfContext,
  MarkdownToken,
  PdfStyle,
} from "../types";

export function getLiteralTokenText(token: MarkdownToken): string {
  if ("raw" in token && token.raw !== undefined && typeof token.raw === "string") {
    return token.raw;
  }
  if ("text" in token && token.text !== undefined && typeof token.text === "string") {
    return token.text;
  }

  return "";
}

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

  // split text into components that will not exceed the maximum line width
  this.setDocStyle(doc, text, style);
  const splitText = doc.splitTextToSize(text, style.maxLineWidth - style.cursorIndex);

  for (const piece of splitText) {
    // Guard for long fragments that still exceed width after splitting.
    if (style.cursorIndex + doc.getTextWidth(piece) > style.maxLineWidth) {
      style.currentHeight += style.lineDistance;
      style.cursorIndex = style.currentWidth;
    }

    style.currentHeight = checkHeight(doc, style);
    this.setDocStyle(doc, piece, style);

    // Links are rendered with an embedded URL, plain text otherwise.
    if (style.link) {
      doc.textWithLink(piece, style.cursorIndex, style.currentHeight, {
        url: style.link,
      });
    } else {
      doc.text(piece, style.cursorIndex, style.currentHeight);
    }

    // Draw a manual strike line because jsPDF does not provide text decoration.
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
