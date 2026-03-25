import docx = require("./docx");
import type { IRunOptions } from "docx";
import type { MarkdownToDocxContext } from "../types";

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
