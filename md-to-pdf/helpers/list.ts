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
  const initialStyle = this.getStyle();

  // Nested lists can appear after inline text inside a list item; force the
  // nested list to start on a fresh line so prefixes do not collide with text.
  if (initialStyle.cursorIndex > initialStyle.currentWidth) {
    this.lineBreak(initialStyle.lineDistance);
  }

  const startStyle = this.getStyle();

  // add bullet point prefix area and increase indent level
  this.updateStyle({
    currentWidth: startStyle.currentWidth + startStyle.indent,
    cursorIndex: startStyle.currentWidth + startStyle.indent,
  });

  const items = token.items || [];
  const start = Number(token.start) || 1;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index] as MarkdownListItemToken;
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
  // The first paragraph in an item should continue after the prefix, not add
  // another paragraph break before content.
  this.updateStyle({ skipParagraphBreak: true });
  this.DFS(token.tokens || []);
}
