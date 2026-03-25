const docx = require("./docx");

function writeCheckBox(token) {
  const currentTextRuns = this.getCurrentTextRuns();
  currentTextRuns.push(new docx.CheckBox({ checked: token.checked }));
  this.setCurrentTextRuns(currentTextRuns);
  this.updateStyle({ prefix: " " });
}

function writeList(token) {
  this.groupParagraph();
  // add bullet point prefix and increase indent level
  this.updateStyle({
    indentLevel: this.style.indentLevel + 1,
    ordered: token.ordered,
  });
  for (let i = 0; i < token.items.length; i++) {
    const item = token.items[i];
    // if ordered, replace bullet point with current index for numbering
    if (token.ordered) {
      item.prefix = `${token.start + i}. `;
    }
    else {
      item.prefix = "\u2022 ";
    }
    this.DFS([item]);
    this.groupParagraph();
  }
}

function writeListItem(token) {
  if (token.loose) {
    this.lineBreak();
  }
  if (token.task) {
    this.writeCheckBox(token);
  }
  this.writeText(token.prefix);
  this.DFS(token.tokens);
}

module.exports = { writeCheckBox, writeList, writeListItem };