function processChild(token) {
  // save current style on stack
  this.pushStyle();

  switch (token.type) {
    // line break
    case "br":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    // checkbox
    case "checkbox":
      this.writeCheckBox(token);
      break;
    // code block
    case "code":
      this.writeCode(token);
      break;
    // inline code
    case "codespan":
      this.writeCodeSpan(token);
      break;
    // unused token
    case "def":
      break;
    // horizontal line
    case "hr":
      this.horizontalLine();
      break;
    // currently not handling HTML tags
    case "html":
      break;
    // image
    case "image":
      this.writeLink(token);
      break;
    // list
    case "list":
      this.writeList(token);
      break;
    // space
    case "space":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    // table
    case "table":
      this.processTable(token);
      break;
    // escaped text and text
    case "escape":
    default:
      this.writeText("text" in token ? String(token.text || "") : "");
      break;
  }

  // restore style from stack (while preserving PDF layout cursor/height)
  this.popStyle();
}

module.exports = {
  processChild,
};
