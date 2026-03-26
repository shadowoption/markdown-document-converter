function processParent(token) {
  // save current style on stack
  this.pushStyle();

  switch (token.type) {
    // blockquote
    case "blockquote":
      this.writeBlockquote(token);
      break;
    // strikethrough
    case "del":
      this.setTextStyle("del");
      this.DFS(token.tokens || []);
      break;
    // italics
    case "em":
      this.setTextStyle("em");
      this.DFS(token.tokens || []);
      break;
    // heading
    case "heading":
      this.writeHeading(token);
      break;
    // images and links
    case "image":
    case "link":
      this.writeLink(token);
      break;
    // list items
    case "list_item":
      this.writeListItem(token);
      break;
    // paragraphs
    case "paragraph":
      if (this.getStyle().skipParagraphBreak) {
        this.updateStyle({ skipParagraphBreak: false });
      } else {
        this.lineBreak(this.getStyle().lineDistance);
      }
      this.DFS(token.tokens || []);
      break;
    // bold
    case "strong":
      this.setTextStyle("strong");
      this.DFS(token.tokens || []);
      break;
    // text
    case "text":
      this.DFS(token.tokens || []);
      break;
    default:
      break;
  }

  // restore style from stack (while preserving PDF layout cursor/height)
  this.popStyle();
}

module.exports = {
  processParent,
};
