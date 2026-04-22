import { checkHeight } from "./styles";
import type {
  MarkdownCheckboxToken,
  MarkdownListItemToken,
  MarkdownToPdfContext,
  JsPdfDoc,
  PdfStyle,
} from "../types";

export function writePrefix(
  this: MarkdownToPdfContext,
  token: MarkdownListItemToken | MarkdownCheckboxToken
): PdfStyle {
  let style = this.getStyle();

  if (token.prefix) {
    style = this.writeText(token.prefix);
  }

  return style;
}

export function chooseSplitWidth(
  text: string,
  remainingWidth: number,
  fullLineWidth: number,
  doc: JsPdfDoc
): number {
  // Clamp widths so splitTextToSize always receives a safe positive value.
  const safeFullLineWidth = Math.max(Number(fullLineWidth) || 0, 1);
  const safeRemainingWidth =
    remainingWidth > 0 ? Math.min(remainingWidth, safeFullLineWidth) : safeFullLineWidth;
  // Only the first visible word matters for deciding whether wrapping should
  // stay on the current line or move to a fresh full-width line.
  const firstWord = String(text || "").trimStart().match(/\S+/)?.[0] || "";

  if (!firstWord) {
    return safeRemainingWidth;
  }

  const firstWordWidth = doc.getTextWidth(firstWord);

  // If the first word does not fit in remaining width but does fit a fresh line,
  // split using full-line width to avoid tiny fragmented chunks.
  if (firstWordWidth > safeRemainingWidth && firstWordWidth <= safeFullLineWidth) {
    return safeFullLineWidth;
  }

  return safeRemainingWidth;
}

function splitTextAtWidth(text: string, maxWidth: number, doc: JsPdfDoc): { firstPiece: string; restText: string } {
  // Split into alternating whitespace/non-whitespace segments so slicing the
  // remainder preserves the original spacing exactly.
  const segments = String(text || "").match(/\s+|\S+/g) || [];

  if (segments.length === 0) {
    return { firstPiece: "", restText: "" };
  }

  let consumedLength = 0;
  let currentText = "";

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const candidate = currentText + segment;

    // Always accept the first segment, then stop as soon as adding the next
    // segment would exceed the allowed width.
    if (currentText.length === 0 || doc.getTextWidth(candidate) <= maxWidth) {
      currentText = candidate;
      consumedLength += segment.length;
      continue;
    }

    return {
      firstPiece: text.slice(0, consumedLength),
      restText: text.slice(consumedLength),
    };
  }

  return { firstPiece: text, restText: "" };
}

export function writeText(this: MarkdownToPdfContext, text: string): PdfStyle {
  text = String(text || "");
  const doc = this.getDoc();
  const lastStyle = this.getStyle();
  const style = { ...lastStyle };

  // split text into components that will not exceed the maximum line width
  this.setDocStyle(doc, text, style);

  const fullLineWidth = style.maxLineWidth - style.currentWidth;
  const remainingWidth = style.maxLineWidth - Math.max(style.cursorIndex, style.currentWidth);
  const splitWidth = chooseSplitWidth(text, remainingWidth, fullLineWidth, doc);

  // Normalize split output so downstream width checks are string-safe.
  let splitText = doc.splitTextToSize(text, splitWidth).map((piece) => String(piece || ""));

  // If text starts mid-line and wraps, only the first visual line should use the
  // remaining width. Continuation lines should use the full line width.
  if (splitWidth < Math.max(fullLineWidth, 1) && splitText.length > 1) {
    // Re-slice the original text instead of reconstructing from split output so
    // continuation text keeps the original whitespace layout.
    const { firstPiece, restText } = splitTextAtWidth(text, splitWidth, doc);
    const restFromOriginal = restText.trimStart();

    if (restFromOriginal.length > 0) {
      // Reflow only the continuation against the full available line width.
      splitText = [firstPiece, ...doc.splitTextToSize(restFromOriginal, Math.max(fullLineWidth, 1))];
    }
  }

  for (let index = 0; index < splitText.length; index += 1) {
    const piece = splitText[index];

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

    // splitTextToSize returns visual lines, so always advance after each
    // non-final piece to preserve wrapping and word boundaries.
    if (index < splitText.length - 1) {
      style.currentHeight += style.lineDistance;
      style.cursorIndex = style.currentWidth;
      style.currentHeight = checkHeight(doc, style);
    }
  }

  this.setStyle(style);

  return style;
}
