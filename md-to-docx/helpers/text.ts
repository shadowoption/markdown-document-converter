import docx = require("./docx");
import type { IRunOptions } from "docx";
import type { MarkdownToDocxContext } from "../types";

export function writeText(this: MarkdownToDocxContext, text: string): void {
  const currentTextRuns = this.getCurrentTextRuns();
  // Create one run per visual line so explicit newlines survive DOCX export.
  const chunks = String(text || "").split("\n");

  for (let index = 0; index < chunks.length; index += 1) {
    const options: IRunOptions = {
      text: chunks[index] || "",
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

    if (index < chunks.length - 1) {
      // DOCX line breaks are represented as an empty run with `break: 1`.
      currentTextRuns.push(
        new docx.TextRun({
          text: "",
          size: this.style.fontSize,
          break: 1,
        })
      );
    }
  }

  this.setCurrentTextRuns(currentTextRuns);
}
