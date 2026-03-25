import type { MarkdownToDocxContext, MarkdownToken } from "../types";

function hasChildren(token: MarkdownToken): token is MarkdownToken & { tokens: MarkdownToken[] } {
  return "tokens" in token && Array.isArray(token.tokens);
}

export function DFS(this: MarkdownToDocxContext, tokens: MarkdownToken[]): void {
  for (const token of tokens) {
    if (hasChildren(token)) {
      this.processParent(token);
    } else {
      this.processChild(token);
    }
  }
}
