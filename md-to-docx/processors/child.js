function processChild(token) {
  // save current style on stack
  this.pushStyle();
  switch (token.type) {
    // breakline
    case "br":
      this.breakLine();
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
      this.groupParagraph();
      this.horizontalLine();
      this.breakLine();
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
      this.breakLine();
      break;

    // table
    case "table":
      this.groupParagraph();
      this.processTable(token);
      this.breakLine();
      break;

    // escaped text and text
    case "escape":
    default:
      // text fallback
      this.writeText(token.text);
      break;
  }
  // restore previous style from stack
  this.popStyle();
}

module.exports = { processChild };