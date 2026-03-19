function writeCode(token) {
  this.groupParagraph();
  this.updateStyle({ font: "Consolas", code: true });
  if (token.codeBlockStyle) {
    this.updateStyle({ indentLevel: this.style.indentLevel + 1 });
  }
  for (const line of token.lines) {
    this.writeText(line);
    this.breakLine();
  }
  this.groupParagraph();
}

function writeCodeSpan(token) {
  this.updateStyle({ font: "Consolas" });
  this.writeText(token.text);
}

module.exports = { writeCode, writeCodeSpan };