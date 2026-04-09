import type { MarkdownHeadingToken, MarkdownToPdfContext } from "../types";

export function writeHeading(this: MarkdownToPdfContext, token: MarkdownHeadingToken): void {
  const headingFontSize = 31 - 3 * token.depth;
  this.updateStyle({
    fontSize: headingFontSize,
    // Wrapped heading lines need larger lineDistance than body text to avoid overlap.
    lineDistance: Math.max(this.getStyle().lineDistance, headingFontSize),
    lineSpc: Math.max(this.getStyle().lineSpc, Math.ceil(headingFontSize * 1.35)),
    bold: true,
  });

  this.lineBreak(this.getStyle().lineSpc);
  this.DFS(token.tokens || []);
  this.lineBreak(this.getStyle().lineSpc);
}
