import type { MarkdownCodeSpanToken, MarkdownCodeToken, MarkdownToPdfContext } from "../types";

function getCurrentPageNumber(doc: any): number | null {
  if (typeof doc?.getCurrentPageInfo === "function") {
    return doc.getCurrentPageInfo()?.pageNumber || null;
  }
  if (typeof doc?.internal?.getCurrentPageInfo === "function") {
    return doc.internal.getCurrentPageInfo()?.pageNumber || null;
  }

  return null;
}

// draw code border across multiple pages if needed
function drawCodeBorder(
  doc: any,
  startStyle: any,
  current: any,
  startPage: number | null,
  endPage: number | null
): void {
  const x = current.currentWidth - current.indent;
  const width = current.maxLineWidth - x;
  const firstPageStartY = Math.max(0, startStyle.currentHeight - startStyle.lineSpc);
  const continuationStartY = Math.max(0, startStyle.startHeight - startStyle.lineSpc);

  // draw multi-page border
  if (
    startPage !== null &&
    endPage !== null &&
    endPage > startPage &&
    typeof doc?.setPage === "function"
  ) {
    doc.setPage(startPage);
    doc.rect(
      x,
      firstPageStartY,
      width,
      Math.max(0, startStyle.pageHeight - firstPageStartY)
    );

    // draw full-page borders on middle pages
    for (let page = startPage + 1; page < endPage; page += 1) {
      doc.setPage(page);
      doc.rect(
        x,
        continuationStartY,
        width,
        Math.max(0, startStyle.pageHeight - continuationStartY)
      );
    }

    // draw border on last page
    doc.setPage(endPage);
    doc.rect(
      x,
      continuationStartY,
      width,
      Math.max(0, current.currentHeight - continuationStartY)
    );
    return;
  }

  // otherwise, draw single-page border
  doc.rect(
    x,
    firstPageStartY,
    width,
    Math.max(0, current.currentHeight - firstPageStartY)
  );
}

export function writeCode(this: MarkdownToPdfContext, token: MarkdownCodeToken): void {
  const doc = this.getDoc();
  this.lineBreak(this.getStyle().lineSpc);

  const startStyle = { ...this.getStyle() };
  const startPage = getCurrentPageNumber(doc);
  this.updateStyle({
    code: true,
    currentWidth: this.getStyle().currentWidth + this.getStyle().indent,
    cursorIndex: this.getStyle().currentWidth + this.getStyle().indent,
  });

  for (const line of token.lines || []) {
    this.writeText(line);
    this.lineBreak(this.getStyle().lineDistance);
  }

  const current = this.getStyle();
  const endPage = getCurrentPageNumber(doc);
  drawCodeBorder(doc, startStyle, current, startPage, endPage);

  this.lineBreak(current.lineDistance);
}

export function writeCodeSpan(this: MarkdownToPdfContext, token: MarkdownCodeSpanToken): void {
  this.updateStyle({ code: true });
  this.writeText(token.text || "");
}
