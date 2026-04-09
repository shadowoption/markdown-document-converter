import docx = require("./docx");
import type { IRunOptions } from "docx";
import type { MarkdownToDocxContext, MarkdownToken } from "../types";

export function getLiteralTokenText(token: MarkdownToken): string {
  if ("raw" in token && token.raw !== undefined && typeof token.raw === "string") {
    return token.raw;
  }
  if ("text" in token && token.text !== undefined && typeof token.text === "string") {
    return token.text;
  }

  return "";
}

export function writeText(this: MarkdownToDocxContext, text: string): void {
  const currentTextRuns = this.getCurrentTextRuns();
  const options: IRunOptions = {
    text,
    font: this.style.font,
    bold: this.style.bold,
    ...(!this.style.headingLevel
      ? {
          size: this.style.fontSize,
          color: this.style.textColor,
          italics: this.style.italics,
          strike: this.style.strike,
        }
      : {}),
    ...(this.style.link ? { style: "Hyperlink" } : {}),
  };

  currentTextRuns.push(new docx.TextRun(options));
  this.setCurrentTextRuns(currentTextRuns);
}
