import createMdToDocx = require("./md-to-docx");
import type { DocxBlock, MarkdownStyle } from "./md-to-docx/types";
import createMdToPdf = require("./md-to-pdf");

const mdToDocx = createMdToDocx() as {
  convert: (text: string, style?: Partial<MarkdownStyle>) => DocxBlock[];
};

const mdToPdf = createMdToPdf() as {
  convert: (doc: any, text: string, style?: Record<string, any>) => number;
};

const exported = {
  mdToDocx,
  mdToPdf,
};

export = exported;
