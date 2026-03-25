import type { MarkdownCodeSpanToken, MarkdownCodeToken, MarkdownToDocxContext } from "../types";

export function writeCode(this: MarkdownToDocxContext, token: MarkdownCodeToken): void {
  this.groupParagraph();
  this.updateStyle({ font: "Consolas", code: true });

  if (token.codeBlockStyle) {
    this.updateStyle({ indentLevel: this.style.indentLevel + 1 });
  }

  for (const line of token.lines || []) {
    this.writeText(String(line));
    this.lineBreak();
  }

  this.groupParagraph();
}

export function writeCodeSpan(this: MarkdownToDocxContext, token: MarkdownCodeSpanToken): void {
  this.updateStyle({ font: "Consolas" });
  this.writeText(String(token.text || ""));
}
