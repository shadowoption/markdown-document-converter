import type { MarkdownLinkToken, MarkdownToPdfContext } from "../types";

export function writeLink(this: MarkdownToPdfContext, token: MarkdownLinkToken): void {
  // save the current style state and switch to link style
  this.updateStyle({
    textColor: this.getStyle().linkColor,
    link: token.href || null,
  });

  // traverse child tokens to build the link text
  if (Array.isArray(token.tokens) && token.tokens.length > 0) {
    this.DFS(token.tokens);
  } else {
    this.writeText(token.text || "");
  }

  // write title if it exists
  if (token.title) {
    this.writeText(` (${token.title})`);
  }
}
