import type { MarkdownBlockquoteToken, MarkdownToPdfContext, PdfStyle } from "../types";

// get current page number from jspdf doc
function getCurrentPageNumber(doc: any): number | null {
  if (typeof doc?.getCurrentPageInfo === "function") {
    return doc.getCurrentPageInfo()?.pageNumber || null;
  }
  if (typeof doc?.internal?.getCurrentPageInfo === "function") {
    return doc.internal.getCurrentPageInfo()?.pageNumber || null;
  }

  return null;
}

// draw blockquote line across multiple pages if blockquote content exceeds one page
function drawBlockquoteLine(
  doc: any,
  startStyle: PdfStyle,
  blockStartStyle: PdfStyle,
  currentStyle: PdfStyle,
  didPreBreakOverflow: boolean,
  startPage: number | null,
  endPage: number | null
): void {
  const lineX = startStyle.currentWidth;
  const startY = didPreBreakOverflow
    ? blockStartStyle.currentHeight + blockStartStyle.lineDistance
    : startStyle.currentHeight + startStyle.lineDistance;

  // draw multi-page line
  if (
    startPage !== null &&
    endPage !== null &&
    endPage > startPage &&
    typeof doc?.setPage === "function"
  ) {
    // draw on first page until page end
    doc.setPage(startPage);
    doc.line(lineX, startY, lineX, startStyle.pageHeight, "S");

    // draw full-page lines on middle pages
    for (let page = startPage + 1; page < endPage; page += 1) {
      doc.setPage(page);
      doc.line(lineX, startStyle.startHeight, lineX, startStyle.pageHeight, "S");
    }

    // draw line on last page
    doc.setPage(endPage);
    doc.line(lineX, startStyle.startHeight, lineX, currentStyle.currentHeight, "S");
    return;
  }

  // otherwise, draw single-page line
  doc.line(lineX, startY, lineX, currentStyle.currentHeight, "S");
}

export function writeBlockquote(this: MarkdownToPdfContext, token: MarkdownBlockquoteToken): void {
  const doc = this.getDoc();
  const startStyle = { ...this.getStyle() };
  const entryPage = getCurrentPageNumber(doc);

  this.updateStyle({
    currentWidth: startStyle.currentWidth + startStyle.indent,
    cursorIndex: startStyle.currentWidth + startStyle.indent,
    textColor: startStyle.blockColor,
    drawColor: startStyle.blockColor,
  });

  this.lineBreak(this.getStyle().lineDistance);
  const blockStartStyle = { ...this.getStyle() };

  const startPage = getCurrentPageNumber(doc);
  const didPreBreakOverflow =
    (entryPage !== null && startPage !== null && startPage > entryPage) ||
    blockStartStyle.currentHeight < startStyle.currentHeight;
  this.DFS(token.tokens || []);
  const endPage = getCurrentPageNumber(doc);

  const currentStyle = this.getStyle();
  drawBlockquoteLine(
    doc,
    startStyle,
    blockStartStyle,
    currentStyle,
    didPreBreakOverflow,
    startPage,
    endPage
  );
}
