function processParent(token) {
  this.pushStyle();
  switch (token.type) {
    case "blockquote":
      this.writeBlockquote(token);
      break;

    case "del":
      this.setTextStyle("del");
      this.DFS(token.tokens);
      break;

    case "em":
      this.setTextStyle("em");
      this.DFS(token.tokens);
      break;

    case "heading":
      this.writeHeading(token);
      break;

    case "image":
      // treat images as links
    case "link":
      this.writeLink(token);
      break;

    case "list_item":
      this.writeListItem(token);
      break;

    case "paragraph":
      this.DFS(token.tokens);
      this.groupParagraph();
      break;

    case "strong":
      this.setTextStyle("strong");
      this.DFS(token.tokens);
      break;

    case "text":
      this.DFS(token.tokens);
      break;

    default:
      break;
  }
  this.popStyle();
}

module.exports = { processParent };