const docx = require("./docx");

function writeCheckBox(token) {
  this.current.push(new docx.CheckBox({ checked: token.checked }));
  this.updateStyle({ prefix: " " });
}

function writeList(token) {
  this.groupParagraph();
  // add bullet point prefix and increase indent level
  this.updateStyle({
    prefix: "\u2022 ",
    indentLevel: this.style.indentLevel + 1,
    ordered: token.ordered,
  });
  for (let i = 0; i < token.items.length; i++) {
    const item = token.items[i];
    // if ordered, replace bullet point with current index for numbering
    if (token.ordered) {
      this.updateStyle({ prefix: `${token.start + i}. ` });
    }
    this.DFS([item]);
    this.groupParagraph();
  }
}

function writeListItem(token) {
  if (token.loose) {
    this.breakLine();
  }
  if (token.task) {
    this.writeCheckBox(token);
  }
  this.writeText(this.style.prefix);
  this.updateStyle({ prefix: "" });
  this.DFS(token.tokens);
}

module.exports = { writeCheckBox, writeList, writeListItem };