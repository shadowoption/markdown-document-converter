import { MarkdownToDocx } from "./MarkdownToDocx";
import type { DocxBlock, MarkdownStyle } from "./types";

interface MdToDocxApi {
  convert: (text: string, style?: Partial<MarkdownStyle>) => DocxBlock[];
}

const createMdToDocx = (): MdToDocxApi => {
  return {
    convert(text: string, style: Partial<MarkdownStyle> = {}) {
      // create MarkdownToDocx instance with user-defined style, if any
      const doc = new MarkdownToDocx(style);
      // convert markdown text to docx paragraph array and return the result
      return doc.convert(text);
    },
  };
};

export = createMdToDocx;
