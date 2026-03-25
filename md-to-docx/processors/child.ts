import type {
  MarkdownCheckboxToken,
  MarkdownCodeSpanToken,
  MarkdownCodeToken,
  MarkdownLinkToken,
  MarkdownListToken,
  MarkdownTableToken,
  MarkdownToDocxContext,
  MarkdownToken,
} from "../types";

export function processChild(this: MarkdownToDocxContext, token: MarkdownToken): void {
  // save current style on stack
  this.pushStyle();

  switch (token.type) {
    // line break
    case "br":
      this.lineBreak();
      break;
    // checkbox
    case "checkbox":
      this.writeCheckBox(token as MarkdownCheckboxToken);
      break;
    // code block
    case "code":
      this.writeCode(token as MarkdownCodeToken);
      break;
    // inline code
    case "codespan":
      this.writeCodeSpan(token as MarkdownCodeSpanToken);
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
      this.writeLink(token as MarkdownLinkToken);
      break;
    // list
    case "list":
      this.writeList(token as MarkdownListToken);
      break;
    // space
    case "space":
      this.lineBreak();
      break;
    // table
    case "table":
      this.groupParagraph();
      this.processTable(token as MarkdownTableToken);
      this.lineBreak();
      break;
    // escaped text and text
    case "escape":
    default:
      // text fallback
      this.writeText("text" in token ? String(token.text || "") : "");
      break;
  }

  // restore previous style from stack
  this.popStyle();
}
