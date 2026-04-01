import type {
  MarkdownBlockquoteToken,
  MarkdownHeadingToken,
  MarkdownLinkToken,
  MarkdownListItemToken,
  MarkdownParagraphToken,
  MarkdownToPdfContext,
  MarkdownToken,
  MarkdownTokenWithTokens,
} from "../types";

function hasChildren(token: MarkdownToken): token is MarkdownTokenWithTokens {
  // Parent-level tokens expose nested tokens that should be traversed recursively.
  return "tokens" in token && Array.isArray(token.tokens);
}

export function processParent(this: MarkdownToPdfContext, token: MarkdownToken): void {
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
      this.DFS(hasChildren(token) ? token.tokens : []);
      break;
    // italics
    case "em":
      this.setTextStyle("em");
      this.DFS(hasChildren(token) ? token.tokens : []);
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
      this.writeParagraph(token as MarkdownParagraphToken);
      break;
    // bold
    case "strong":
      this.setTextStyle("strong");
      this.DFS(hasChildren(token) ? token.tokens : []);
      break;
    // text
    case "text":
      this.DFS(hasChildren(token) ? token.tokens : []);
      break;
    default:
      break;
  }

  // restore style from stack
  this.popStyle();
}
