import { MarkdownToPdf } from "./MarkdownToPdf";
import type { JsPdfDoc, PdfStyle } from "./types";

interface MdToPdfApi {
  convert: (doc: JsPdfDoc, text: string, style?: Partial<PdfStyle>) => number;
}

const createMdToPdf = (): MdToPdfApi => {
  return {
    convert(doc: JsPdfDoc, text: string, style: Partial<PdfStyle> = {}) {
      const converter = new MarkdownToPdf(style);
      return converter.convert(doc, text);
    },
  };
};

export = createMdToPdf;
