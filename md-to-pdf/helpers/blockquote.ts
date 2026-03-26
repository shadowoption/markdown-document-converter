import type { MarkdownBlockquoteToken, MarkdownToPdfContext } from "../types";

export function writeBlockquote(this: MarkdownToPdfContext, token: MarkdownBlockquoteToken): void {
  const doc = this.getDoc();
  const prev = this.getStyle();

  this.updateStyle({
    currentWidth: prev.currentWidth + prev.indent,
    cursorIndex: prev.currentWidth + prev.indent,
    textColor: prev.blockColor,
    drawColor: prev.blockColor,
  });

  this.lineBreak(this.getStyle().lineDistance);
  this.DFS(token.tokens || []);

  const current = this.getStyle();
  doc.line(
    prev.currentWidth,
    prev.currentHeight + prev.lineDistance,
    prev.currentWidth,
    current.currentHeight,
    "S"
  );

  this.updateStyle({
    currentWidth: prev.currentWidth,
    cursorIndex: prev.currentWidth,
    textColor: prev.textColor,
    drawColor: prev.drawColor,
    currentHeight: current.currentHeight,
  });
}
