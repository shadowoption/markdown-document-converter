import docx = require("./docx");
import type {
  MarkdownCheckboxToken,
  MarkdownListItemToken,
  MarkdownListToken,
  MarkdownToDocxContext,
} from "../types";

export function writeCheckBox(this: MarkdownToDocxContext, token: MarkdownCheckboxToken): void {
  const currentTextRuns = this.getCurrentTextRuns();
  currentTextRuns.push(new docx.CheckBox({ checked: Boolean(token.checked) }));
  this.setCurrentTextRuns(currentTextRuns);
  this.updateStyle({ prefix: " " });
}

export function writeList(this: MarkdownToDocxContext, token: MarkdownListToken): void {
  this.groupParagraph();
  // add bullet point prefix and increase indent level
  this.updateStyle({
    indentLevel: this.style.indentLevel + 1,
    ordered: Boolean(token.ordered),
  });

  const items = (token.items || []) as MarkdownListItemToken[];
  const start = Number(token.start) || 1;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // if ordered, replace bullet point with current index for numbering
    if (token.ordered) {
      item.prefix = `${start + i}. `;
    } else {
      item.prefix = "\u2022 ";
    }
    this.DFS([item]);
    this.groupParagraph();
  }
}

export function writeListItem(this: MarkdownToDocxContext, token: MarkdownListItemToken): void {
  if (token.loose) {
    this.lineBreak();
  }
  if (token.task) {
    this.writeCheckBox(token);
  }
  this.writeText(String(token.prefix || ""));
  this.DFS(token.tokens || []);
}
