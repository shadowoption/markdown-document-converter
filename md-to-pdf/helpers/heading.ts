import type { MarkdownHeadingToken, MarkdownToPdfContext } from "../types";

export function writeHeading(this: MarkdownToPdfContext, token: MarkdownHeadingToken): void {
  this.updateStyle({
    fontSize: 31 - 3 * token.depth,
    bold: true,
  });

  const headingStyle = this.getStyle();
  this.lineBreak(headingStyle.lineSpc + headingStyle.fontSize);
  this.DFS(token.tokens || []);
  this.lineBreak(this.getStyle().lineSpc);
}
