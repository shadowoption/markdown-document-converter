import type { MarkdownLinkToken, MarkdownToPdfContext } from "../types";

export function writeLink(this: MarkdownToPdfContext, token: MarkdownLinkToken): void {
  const prev = this.getStyle();
  this.updateStyle({
    textColor: this.getStyle().linkColor,
    link: token.href || null,
  });

  if (Array.isArray(token.tokens) && token.tokens.length > 0) {
    this.DFS(token.tokens);
  } else {
    this.writeText(token.text || "");
  }

  if (token.title) {
    this.writeText(` (${token.title})`);
  }

  this.updateStyle({
    textColor: prev.textColor,
    link: prev.link,
  });
}
