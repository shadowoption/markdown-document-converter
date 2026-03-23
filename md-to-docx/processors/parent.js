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
      this.DFS(token.tokens);
      break;

    // italics
    case "em":
      this.setTextStyle("em");
      this.DFS(token.tokens);
      break;

    // heading
    case "heading":
      this.writeHeading(token);
      break;

    // images and links
    case "image":
      // treat images as links
    case "link":
      this.writeLink(token);
      break;

    // list items
    case "list_item":
      this.writeListItem(token);
      break;

    // paragraphs
    case "paragraph":
      this.DFS(token.tokens);
      this.groupParagraph();
      break;

    // bold
    case "strong":
      this.setTextStyle("strong");
      this.DFS(token.tokens);
      break;

    // text
    case "text":
      this.DFS(token.tokens);
      break;

    default:
      break;
  }
  // restore style from stack
  this.popStyle();
}

module.exports = { processParent };