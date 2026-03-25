import docx = require("./docx");
import type { IBordersOptions, IParagraphOptions } from "docx";
import type { MarkdownToDocxContext } from "../types";

export function groupParagraph(this: MarkdownToDocxContext): void {
  const currentTextRuns = this.getCurrentTextRuns();
  if (currentTextRuns.length === 0) {
    return;
  }

  const quoteBorder = this.style.quote
    ? {
        left: {
          color: this.style.blockColor,
          space: 4,
          style: "single" as const,
          size: Math.floor(this.style.fontSize / 2),
        },
      }
    : undefined;

  const codeBorder = this.style.code
    ? (() => {
        const border: IBordersOptions["left"] = {
          color: this.style.blockColor,
          space: 4,
          style: "single" as const,
          size: Math.floor(this.style.fontSize / 2),
        };
        return {
          left: border,
          right: border,
          top: border,
          bottom: border,
        };
      })()
    : undefined;

  const options: IParagraphOptions = {
    children: currentTextRuns,
    ...(this.style.headingLevel ? { heading: this.style.headingLevel } : {}),
    ...((quoteBorder || codeBorder) ? { border: codeBorder || quoteBorder } : {}),
    ...(this.style.indentLevel > 0
      ? {
          indent: {
            left: this.style.indentLevel * this.style.fontSize * 10,
          },
        }
      : {}),
  };

  const paragraphs = this.getParagraphs();
  paragraphs.push(new docx.Paragraph(options));
  this.setParagraphs(paragraphs);
  this.setCurrentTextRuns([]);
}
