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
  const prev = this.getStyle();

  // add bullet point prefix area and increase indent level
  this.updateStyle({
    currentWidth: prev.currentWidth + prev.indent,
    cursorIndex: prev.currentWidth + prev.indent,
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

  const current = this.getStyle();
  this.updateStyle({
    currentWidth: prev.currentWidth,
    cursorIndex: prev.cursorIndex,
    currentHeight: current.currentHeight,
  });
}

export function writeListItem(this: MarkdownToPdfContext, token: MarkdownListItemToken): void {
  const style = this.getStyle();
  this.lineBreak(token.loose ? style.lineSpc : style.lineDistance);

  if (token.task) {
    token.prefix = `${token.prefix || ""}${token.checked ? "[X] " : "[ ] "}`;
  }

  this.writePrefix(token);
  this.updateStyle({ skipParagraphBreak: true });
  this.DFS(token.tokens || []);
}
