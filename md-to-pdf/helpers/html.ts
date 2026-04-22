import type { MarkdownToPdfContext, MarkdownToken } from "../types";

export function getLiteralTokenText(token: MarkdownToken): string {
  if ("raw" in token && token.raw && typeof token.raw === "string") {
    return token.raw;
  }
  if ("text" in token && token.text && typeof token.text === "string") {
    return token.text;
  }

  return "";
}

function getTrailingNewlineCount(raw: string): number {
  // Only trailing newlines matter for spacing after a rendered HTML block.
  const match = String(raw || "").match(/\n+$/);

  return match ? match[0].length : 0;
}

export function writeHtml(this: MarkdownToPdfContext, token: MarkdownToken): void {
  // Keep raw HTML visible in output instead of dropping unsupported tokens.
  const rawText = getLiteralTokenText(token);
  this.writeText(rawText);

  // Block HTML tokens can carry trailing newlines in `raw`. Preserve blank
  // lines that would otherwise be lost when rendered as literal text.
  const isBlockHtml = "block" in token && Boolean((token as any).block);
  if (isBlockHtml) {
    const trailingNewlines = getTrailingNewlineCount(rawText);
    const extraBreaks = Math.max(0, trailingNewlines - 1);

    for (let i = 0; i < extraBreaks; i += 1) {
      this.lineBreak(this.getStyle().lineDistance);
    }
  }
}