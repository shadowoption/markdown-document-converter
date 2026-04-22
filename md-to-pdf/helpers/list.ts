import type {
  MarkdownCheckboxToken,
  MarkdownListItemToken,
  MarkdownListToken,
  MarkdownToPdfContext,
} from "../types";

export function writeCheckBox(this: MarkdownToPdfContext, token: MarkdownCheckboxToken): void {
  token.prefix = token.checked ? "[X] " : "[ ] ";
  this.writePrefix(token);
}

export function writeList(this: MarkdownToPdfContext, token: MarkdownListToken): void {
  const startStyle = this.getStyle();

  // add bullet point prefix area and increase indent level
  this.updateStyle({
    currentWidth: startStyle.currentWidth + startStyle.indent,
    cursorIndex: startStyle.currentWidth + startStyle.indent,
  });

  const items = token.items || [];
  const start = token.start != null ? Number(token.start) : 1;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    // if ordered, replace bullet point with current index for numbering
    if (token.ordered) {
      item.prefix = `${start + index}. `;
    } else {
      item.prefix = "\u2022 ";
    }
    this.DFS([item]);
  }
}

export function writeListItem(this: MarkdownToPdfContext, token: MarkdownListItemToken): void {
  const style = this.getStyle();
  this.lineBreak(token.loose ? style.lineSpc : style.lineDistance);

  this.writePrefix(token);
  const itemTokens = token.tokens || [];

  // Only suppress the paragraph break when the list item actually starts with
  // a paragraph token. Non-paragraph item starts (for example plain text or a
  // nested list) should not leak skipParagraphBreak into following blocks.
  this.updateStyle({ skipParagraphBreak: itemTokens[0]?.type === "paragraph" });
  this.DFS(itemTokens);
}
