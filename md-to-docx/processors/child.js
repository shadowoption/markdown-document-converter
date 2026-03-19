function processChild(token) {
  this.pushStyle();
  switch (token.type) {
    case "br":
      this.breakLine();
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
      // unused token
      break;

    case "hr":
      this.groupParagraph();
      this.horizontalLine();
      this.breakLine();
      break;

    case "html":
      // currently not handling HTML tags
      break;

    case "image":
      this.writeLink(token);
      break;

    case "list":
      this.writeList(token);
      break;

    case "space":
      this.breakLine();
      break;

    case "table":
      this.groupParagraph();
      this.processTable(token);
      this.breakLine();
      break;

    case "escape":
    default:
      // text fallback
      this.writeText(token.text);
      break;
  }
  this.popStyle();
}

module.exports = { processChild };