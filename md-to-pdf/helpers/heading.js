function writeHeading(token) {
  const prev = this.getStyle();

  this.updateStyle({
    fontSize: 31 - 3 * token.depth,
    bold: true,
  });

  const headingStyle = this.getStyle();
  this.lineBreak(headingStyle.lineSpc + headingStyle.fontSize);
  this.DFS(token.tokens || []);
  this.lineBreak(this.getStyle().lineSpc);

  this.updateStyle({
    fontSize: prev.fontSize,
    bold: prev.bold,
  });
}

module.exports = {
  writeHeading,
};
