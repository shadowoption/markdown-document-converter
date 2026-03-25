import type {
  MarkdownBlockquoteToken,
  MarkdownHeadingToken,
  MarkdownLinkToken,
  MarkdownListItemToken,
  MarkdownToDocxContext,
  MarkdownToken,
} from "../types";

export function processParent(this: MarkdownToDocxContext, token: MarkdownToken): void {
  // save current style on stack
  this.pushStyle();

  switch (token.type) {
    // blockquote
    case "blockquote":
      this.writeBlockquote(token as MarkdownBlockquoteToken);
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
      this.writeHeading(token as MarkdownHeadingToken);
      break;
    // images and links
    case "image":
      // treat images as links
    case "link":
      this.writeLink(token as MarkdownLinkToken);
      break;
    // list items
    case "list_item":
      this.writeListItem(token as MarkdownListItemToken);
      break;
    // paragraphs
    case "paragraph":
      this.DFS(token.tokens || []);
      this.groupParagraph();
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

  // restore style from stack
  this.popStyle();
}
