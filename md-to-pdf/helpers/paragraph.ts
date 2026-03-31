import type { MarkdownParagraphToken, MarkdownToPdfContext } from "../types";

export function writeParagraph(this: MarkdownToPdfContext, token: MarkdownParagraphToken): void {
  // List items set this flag so paragraph content follows the item prefix
  // without introducing an extra blank line first.
  if (this.getStyle().skipParagraphBreak) {
    this.updateStyle({ skipParagraphBreak: false });
  } else {
    this.lineBreak(this.getStyle().lineDistance);
  }

  this.DFS(token.tokens || []);
}
