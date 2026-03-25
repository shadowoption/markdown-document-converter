import type { MarkdownBlockquoteToken, MarkdownToDocxContext } from "../types";

export function writeBlockquote(this: MarkdownToDocxContext, token: MarkdownBlockquoteToken): void {
  this.groupParagraph();
  this.updateStyle({
    quote: true,
    indentLevel: this.style.indentLevel + 1,
    textColor: this.style.blockColor,
  });
  this.DFS(token.tokens || []);
  this.groupParagraph();
}
