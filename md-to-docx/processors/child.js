function processChild(token) {
  // save current style on stack
  this.pushStyle();
  switch (token.type) {
    // line break
    case "br":
      this.lineBreak();
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
      this.lineBreak();
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
      this.lineBreak();
      break;

    // table
    case "table":
      this.groupParagraph();
      this.processTable(token);
      this.lineBreak();
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