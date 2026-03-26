import type { MarkdownToPdfContext, MarkdownToken } from "../types";

export function processChild(this: MarkdownToPdfContext, token: MarkdownToken): void {
  // save current style on stack
  this.pushStyle();

  switch (token.type) {
    // line break
    case "br":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    // checkbox
    case "checkbox":
      this.writeCheckBox(token as any);
      break;
    // code block
    case "code":
      this.writeCode(token as any);
      break;
    // inline code
    case "codespan":
      this.writeCodeSpan(token as any);
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
      this.writeLink(token as any);
      break;
    // list
    case "list":
      this.writeList(token as any);
      break;
    // space
    case "space":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    // table
    case "table":
      this.processTable(token as any);
      break;
    // escaped text and text
    case "escape":
    default:
      // text fallback
      this.writeText("text" in token ? String((token as any).text || "") : "");
      break;
  }

  // restore previous style from stack
  this.popStyle();
}
