function processChild(token) {
  this.pushStyle();

  switch (token.type) {
    case "br":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    case "checkbox":
      this.writeCheckBox(token);
      break;
    case "code":
      this.writeCode(token);
      break;
    case "codespan":
      this.writeCodeSpan(token);
      break;
    case "def":
      break;
    case "hr":
      this.horizontalLine();
      break;
    case "html":
      break;
    case "image":
      this.writeLink(token);
      break;
    case "list":
      this.writeList(token);
      break;
    case "space":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    case "table":
      this.processTable(token);
      break;
    case "escape":
    default:
      this.writeText("text" in token ? String(token.text || "") : "");
      break;
  }

  this.popStyle();
}

module.exports = {
  processChild,
};
