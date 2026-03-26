import type { MarkdownToPdfContext, MarkdownToken } from "../types";

function hasChildren(token: MarkdownToken): boolean {
  return (
    Object.prototype.hasOwnProperty.call(token, "tokens") &&
    Array.isArray((token as any).tokens)
  );
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
