import docx = require("./docx");
import type { MarkdownLinkToken, MarkdownToDocxContext } from "../types";

export function writeLink(this: MarkdownToDocxContext, token: MarkdownLinkToken): void {
  const currentTextRuns = this.getCurrentTextRuns();
  // save the current state of the document and start a new one for the link
  const state = currentTextRuns.slice();
  this.setCurrentTextRuns([]);

  const href = String(token.href || "");
  this.updateStyle({ link: href, textColor: this.style.linkColor });

  // traverse child tokens to build the link text
  if (token.tokens) {
    this.DFS(token.tokens);
  }

  // write title if it exists
  if (token.title) {
    this.writeText(` (${String(token.title)})`);
  }

  const linkChildren = this.getCurrentTextRuns();
  const link = new docx.ExternalHyperlink({
    children: linkChildren as any,
    link: href,
  });

  // restore the previous state of the document and add the link
  const restored = state.slice();
  restored.push(link);
  this.setCurrentTextRuns(restored);
}
