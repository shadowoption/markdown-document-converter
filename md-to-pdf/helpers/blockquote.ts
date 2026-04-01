import type { MarkdownBlockquoteToken, MarkdownToPdfContext } from "../types";

export function writeBlockquote(this: MarkdownToPdfContext, token: MarkdownBlockquoteToken): void {
  const doc = this.getDoc();
  const startStyle = this.getStyle();

  this.updateStyle({
    currentWidth: startStyle.currentWidth + startStyle.indent,
    cursorIndex: startStyle.currentWidth + startStyle.indent,
    textColor: startStyle.blockColor,
    drawColor: startStyle.blockColor,
  });

  this.lineBreak(this.getStyle().lineDistance);
  this.DFS(token.tokens || []);

  const current = this.getStyle();
  doc.line(
    startStyle.currentWidth,
    startStyle.currentHeight + startStyle.lineDistance,
    startStyle.currentWidth,
    current.currentHeight,
    "S"
  );
}
