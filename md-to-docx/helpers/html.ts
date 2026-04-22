import type { MarkdownToken } from "../types";

export function getLiteralTokenText(token: MarkdownToken): string {
  if ("raw" in token && token.raw !== undefined && typeof token.raw === "string") {
    return token.raw;
  }
  if ("text" in token && token.text !== undefined && typeof token.text === "string") {
    return token.text;
  }

  return "";
}
