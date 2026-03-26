function writeCode(token) {
  const doc = this.getDoc();
  const prev = this.getStyle();

  this.lineBreak(prev.lineSpc);
  this.updateStyle({ code: true });

  if (token.codeBlockStyle) {
    const style = this.getStyle();
    this.updateStyle({
      currentWidth: style.currentWidth + style.indent,
      cursorIndex: style.currentWidth + style.indent,
    });
  }

  for (const line of token.lines || []) {
    this.writeText(line);
    this.lineBreak(this.getStyle().lineDistance);
  }

  const current = this.getStyle();
  doc.rect(
    prev.startWidth - 10,
    prev.currentHeight,
    current.maxLineWidth - (prev.startWidth - 10),
    current.currentHeight - prev.currentHeight
  );

  this.lineBreak(current.lineDistance);
  const finalStyle = this.getStyle();
  this.updateStyle({
    code: prev.code,
    currentWidth: prev.currentWidth,
    cursorIndex: prev.currentWidth,
    currentHeight: finalStyle.currentHeight,
  });
}

function writeCodeSpan(token) {
  const prev = this.getStyle();
  this.updateStyle({ code: true });
  this.writeText(token.text || "");
  this.updateStyle({ code: prev.code });
}

module.exports = {
  writeCode,
  writeCodeSpan,
};
