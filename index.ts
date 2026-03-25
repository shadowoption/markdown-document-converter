import createMdToDocx = require("./md-to-docx");
import type { DocxBlock, MarkdownStyle } from "./md-to-docx/types";

const mdToDocx = createMdToDocx() as {
  convert: (text: string, style?: Partial<MarkdownStyle>) => DocxBlock[];
};

const exported = {
  mdToDocx,
};

export = exported;
