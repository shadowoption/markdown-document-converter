import type { MarkdownToPdfContext, MarkdownToken } from "../types";

export function processParent(this: MarkdownToPdfContext, token: MarkdownToken): void {
  // save current style on stack
  this.pushStyle();

  switch (token.type) {
    // blockquote
    case "blockquote":
      this.writeBlockquote(token as any);
      break;
    // strikethrough
    case "del":
      this.setTextStyle("del");
      this.DFS((token as any).tokens || []);
      break;
    // italics
    case "em":
      this.setTextStyle("em");
      this.DFS((token as any).tokens || []);
      break;
    // heading
    case "heading":
      this.writeHeading(token as any);
      break;
    // images and links
    case "image":
      // treat images as links
    case "link":
      this.writeLink(token as any);
      break;
    // list items
    case "list_item":
      this.writeListItem(token as any);
      break;
    // paragraphs
    case "paragraph":
      if (this.getStyle().skipParagraphBreak) {
        this.updateStyle({ skipParagraphBreak: false });
      } else {
        this.lineBreak(this.getStyle().lineDistance);
      }
      this.DFS((token as any).tokens || []);
      break;
    // bold
    case "strong":
      this.setTextStyle("strong");
      this.DFS((token as any).tokens || []);
      break;
    // text
    case "text":
      this.DFS((token as any).tokens || []);
      break;
    default:
      break;
  }

  // restore style from stack
  this.popStyle();
}
