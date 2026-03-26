function writeCheckBox(token) {
  token.prefix = token.checked ? "[X] " : "[ ] ";
  this.writePrefix(token);
}

function writeList(token) {
  const prev = this.getStyle();

  this.updateStyle({
    currentWidth: prev.currentWidth + prev.indent,
    cursorIndex: prev.currentWidth + prev.indent,
  });

  const items = token.items || [];
  const start = Number(token.start) || 1;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
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

function writeListItem(token) {
  const style = this.getStyle();
  this.lineBreak(token.loose ? style.lineSpc : style.lineDistance);

  if (token.task) {
    token.prefix = `${token.prefix || ""}${token.checked ? "[X] " : "[ ] "}`;
  }

  this.writePrefix(token);
  this.updateStyle({ skipParagraphBreak: true });
  this.DFS(token.tokens || []);
}

module.exports = {
  writeCheckBox,
  writeList,
  writeListItem,
};
