import createMdToDocx = require("./md-to-docx");
import type { DocxBlock, MarkdownStyle } from "./md-to-docx/types";
import createMdToPdf = require("./md-to-pdf");
import type { JsPdfDoc, PdfStyle } from "./md-to-pdf/types";

const mdToDocx = createMdToDocx() as {
  convert: (text: string, style?: Partial<MarkdownStyle>) => DocxBlock[];
};

const mdToPdf = createMdToPdf() as {
  convert: (doc: JsPdfDoc, text: string, style?: Partial<PdfStyle>) => number;
};

const exported = {
  mdToDocx,
  mdToPdf,
};

export = exported;
