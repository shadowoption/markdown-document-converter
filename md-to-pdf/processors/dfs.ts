import type { MarkdownToPdfContext, MarkdownToken, MarkdownTokenWithTokens } from "../types";

function hasChildren(token: MarkdownToken): token is MarkdownTokenWithTokens {
  // Tokens with nested `tokens` are handled by `processParent`.
  return "tokens" in token && Array.isArray(token.tokens);
}

export function DFS(this: MarkdownToPdfContext, tokens: MarkdownToken[]): void {
  for (const token of tokens) {
    if (hasChildren(token)) {
      this.processParent(token);
    } else {
      this.processChild(token);
    }
  }
}
