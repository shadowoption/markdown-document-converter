import { getHeadingMap } from "./styles";
import type { MarkdownHeadingToken, MarkdownToDocxContext } from "../types";

export function writeHeading(this: MarkdownToDocxContext, token: MarkdownHeadingToken): void {
  const headingMap = getHeadingMap();
  this.groupParagraph();
  this.updateStyle({
    headingLevel: headingMap[Number(token.depth) || 0] || null,
    bold: true,
  });
  this.DFS(token.tokens || []);
  this.groupParagraph();
  this.lineBreak();
}
