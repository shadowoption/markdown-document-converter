import type { MarkdownToken } from "../types";

export function getLiteralTokenText(token: MarkdownToken): string {
  if ("raw" in token && token.raw && typeof token.raw === "string") {
    return token.raw;
  }
  if ("text" in token && token.text && typeof token.text === "string") {
    return token.text;
  }

  return "";
}

function isBlockHtml(token: MarkdownToken): boolean {
  return token.type === "html" && "block" in token && Boolean((token as Record<string, unknown>).block);
}

function toParagraph(line: string): MarkdownToken {
  return {
    type: "paragraph" as const,
    raw: line,
    text: line,
    tokens: [{ type: "text" as const, raw: line, text: line, escaped: false }],
  };
}

// One space token per blank line, using "\n\n" to match Marked's natural encoding.
function addSpace(): MarkdownToken {
  return { type: "space" as const, raw: "\n\n" };
}

// Marked greedily absorbs everything after a block HTML tag (e.g. <div>) into
// a single html token, including unrelated plain-text lines that follow. Expand
// each block html token into one token per line, preserving blank lines as space
// tokens.
export function expandBlockHtmlTokens(tokens: MarkdownToken[]): void {
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    if (!isBlockHtml(tokens[i])) continue;

    const replacement: MarkdownToken[] = [];
    // Marked's block HTML raw always ends with the "\n\n" blank-line delimiter it
    // consumed. Strip one trailing "\n" so split("\n") produces one empty string
    // per blank line instead of two, matching the spacing of inline tags like <em>.
    for (const line of getLiteralTokenText(tokens[i]).replace(/\n$/, "").split("\n")) {
      if (!line) {
        replacement.push(addSpace());
      } else {
        replacement.push(toParagraph(line));
      }
    }

    // Replace the single block html token at index i with the expanded tokens.
    tokens.splice(i, 1, ...replacement);
  }
}