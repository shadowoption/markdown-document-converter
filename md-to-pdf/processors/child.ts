import type { MarkdownToPdfContext, MarkdownToken } from "../types";

export function processChild(this: MarkdownToPdfContext, token: MarkdownToken): void {
  this.pushStyle();

  switch (token.type) {
    case "br":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    case "checkbox":
      this.writeCheckBox(token as any);
      break;
    case "code":
      this.writeCode(token as any);
      break;
    case "codespan":
      this.writeCodeSpan(token as any);
      break;
    case "def":
      break;
    case "hr":
      this.horizontalLine();
      break;
    case "html":
      break;
    case "image":
      this.writeLink(token as any);
      break;
    case "list":
      this.writeList(token as any);
      break;
    case "space":
      this.lineBreak(this.getStyle().lineDistance);
      break;
    case "table":
      this.processTable(token as any);
      break;
    case "escape":
    default:
      this.writeText("text" in token ? String((token as any).text || "") : "");
      break;
  }

  this.popStyle();
}
