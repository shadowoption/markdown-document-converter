import type { MarkdownCodeSpanToken, MarkdownCodeToken, MarkdownToPdfContext } from "../types";

export function writeCode(this: MarkdownToPdfContext, token: MarkdownCodeToken): void {
  const doc = this.getDoc();
  const startStyle = this.getStyle();

  this.lineBreak(startStyle.lineSpc);
  this.updateStyle({ code: true });

  if (token.codeBlockStyle) {
    const style = this.getStyle();
    this.updateStyle({
      currentWidth: style.currentWidth + style.indent,
      cursorIndex: style.currentWidth + style.indent,
    });
  }

  for (const line of token.lines || []) {
    this.writeText(line);
    this.lineBreak(this.getStyle().lineDistance);
  }

  const current = this.getStyle();
  // Draw a border from the block's initial Y to the final cursor Y.
  doc.rect(
    startStyle.startWidth - 10,
    startStyle.currentHeight,
    current.maxLineWidth - (startStyle.startWidth - 10),
    current.currentHeight - startStyle.currentHeight
  );

  this.lineBreak(current.lineDistance);
}

export function writeCodeSpan(this: MarkdownToPdfContext, token: MarkdownCodeSpanToken): void {
  this.updateStyle({ code: true });
  this.writeText(token.text || "");
}
