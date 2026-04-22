import docx = require("./docx");
import type { DocxHeadingLevel, MarkdownStyle, MarkdownToDocxContext, MarkdownToken } from "../types";

const DEFAULT_STYLE: MarkdownStyle = {
  font: "Arial",
  textColor: "333333",
  linkColor: "0000EE",
  blockColor: "858585",
  fontSize: 22,
  indentLevel: 0,
  headingLevel: null,
  link: null,
  bold: false,
  italics: false,
  strike: false,
  code: false,
  quote: false,
  ordered: false,
};

const _HEADING_MAP: Array<DocxHeadingLevel | null> = [
  null,
  docx.HeadingLevel.HEADING_1,
  docx.HeadingLevel.HEADING_2,
  docx.HeadingLevel.HEADING_3,
  docx.HeadingLevel.HEADING_4,
  docx.HeadingLevel.HEADING_5,
  docx.HeadingLevel.HEADING_6,
];

export function getDefaultStyle(): MarkdownStyle {
  return { ...DEFAULT_STYLE };
}

export function getHeadingMap(): Array<DocxHeadingLevel | null> {
  return [..._HEADING_MAP];
}

export function pushStyle(this: MarkdownToDocxContext): void {
  // push the current style onto the stack
  this.styleStack = this.styleStack || [];
  this.styleStack.push({ ...this.style });
}

export function popStyle(this: MarkdownToDocxContext): void {
  // pop the last style from the stack and set it as the current style
  if (this.styleStack && this.styleStack.length > 0) {
    const popped = this.styleStack.pop();
    if (popped) {
      this.style = popped;
      return;
    }
  }
  throw new Error("Style stack underflow: no styles to pop");
}

export function updateStyle(this: MarkdownToDocxContext, partial: Partial<MarkdownStyle> = {}): void {
  // update the current style with the given partial style
  this.style = {
    ...this.style,
    ...partial,
  };
}

export function setTextStyle(this: MarkdownToDocxContext, type: string): void {
  // set text style based on the given type (e.g., "strong", "em", "del")
  switch (type) {
    case "strong":
      this.updateStyle({ bold: true });
      break;
    case "em":
      this.updateStyle({ italics: true });
      break;
    case "del":
      this.updateStyle({ strike: true });
      break;
    default:
      break;
  }
}

export function getSpaceBreakCount(this: MarkdownToDocxContext, token: MarkdownToken): number {
  if (token.type !== "space") {
    return 1;
  }

  // Marked encodes a single blank line between blocks as raw "\n\n". The
  // following block renderer already adds its own leading break, so convert raw
  // newline count into blank-line count to avoid double-spacing.
  const raw = "raw" in token && typeof token.raw === "string" ? token.raw : "";
  const newlineCount = (raw.match(/\n/g) || []).length;

  return Math.max(1, newlineCount - 1);
}
