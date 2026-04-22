import type {
  MarkdownCheckboxToken,
  MarkdownCodeSpanToken,
  MarkdownCodeToken,
  MarkdownLinkToken,
  MarkdownListToken,
  MarkdownTableToken,
  MarkdownToPdfContext,
  MarkdownToken,
} from "../types";

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
      this.horizontalLine();
      break;
    // Render raw HTML tokens as literal text so content is not silently lost.
    case "html": {
      this.writeHtml(token);
      break;
    }
    // image
    case "image":
      this.writeLink(token as MarkdownLinkToken);
      break;
    // list
    case "list":
      this.writeList(token as MarkdownListToken);
      break;
    // space
    case "space": {
      // Preserve explicit blank-line runs by expanding the raw newline count.
      const breakCount = this.getSpaceBreakCount(token);

      for (let i = 0; i < breakCount; i += 1) {
        this.lineBreak(this.getStyle().lineDistance);
      }
      break;
    }
    // table
    case "table":
      this.processTable(token as MarkdownTableToken);
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
