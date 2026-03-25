import docx = require("./docx");
import type { MarkdownToDocxContext } from "../types";

export function horizontalLine(this: MarkdownToDocxContext): void {
  const paragraphs = this.getParagraphs();
  const options = {
    border: {
      bottom: {
        color: this.style.blockColor,
        space: 1,
        style: "single" as const,
        size: 6,
      },
    },
  };

  paragraphs.push(new docx.Paragraph(options as any));
  this.setParagraphs(paragraphs);
}

export function lineBreak(this: MarkdownToDocxContext): void {
  const currentTextRuns = this.getCurrentTextRuns();
  const options = {
    text: "",
    size: this.style.fontSize,
    break: 1,
  };

  currentTextRuns.push(new docx.TextRun(options));
  this.setCurrentTextRuns(currentTextRuns);
}
