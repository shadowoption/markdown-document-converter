function processParent(token) {
  this.pushStyle();

  switch (token.type) {
    case "blockquote":
      this.writeBlockquote(token);
      break;
    case "del":
      this.setTextStyle("del");
      this.DFS(token.tokens || []);
      break;
    case "em":
      this.setTextStyle("em");
      this.DFS(token.tokens || []);
      break;
    case "heading":
      this.writeHeading(token);
      break;
    case "image":
    case "link":
      this.writeLink(token);
      break;
    case "list_item":
      this.writeListItem(token);
      break;
    case "paragraph":
      if (this.getStyle().skipParagraphBreak) {
        this.updateStyle({ skipParagraphBreak: false });
      } else {
        this.lineBreak(this.getStyle().lineDistance);
      }
      this.DFS(token.tokens || []);
      break;
    case "strong":
      this.setTextStyle("strong");
      this.DFS(token.tokens || []);
      break;
    case "text":
      this.DFS(token.tokens || []);
      break;
    default:
      break;
  }

  this.popStyle();
}

module.exports = {
  processParent,
};
