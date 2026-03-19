function writeBlockquote(token) {
  this.groupParagraph();
  this.updateStyle({
    quote: true,
    indentLevel: this.style.indentLevel + 1,
    textColor: this.style.blockColor,
  });
  this.DFS(token.tokens);
  this.groupParagraph();
}

module.exports = { writeBlockquote };