import type { Token, Tokens, TokensList } from "marked";

export type MarkdownToken = Token;
export type MarkdownTokensList = TokensList;
export type MarkdownHeadingToken = Tokens.Heading;
export type MarkdownBlockquoteToken = Tokens.Blockquote;
export type MarkdownLinkToken = Tokens.Link | Tokens.Image;
export type MarkdownCheckboxToken = (Tokens.Checkbox | Tokens.ListItem) & {
  prefix?: string;
  checked?: boolean;
};
export type MarkdownListToken = Tokens.List;
export type MarkdownListItemToken = Tokens.ListItem & { prefix?: string };
export type MarkdownCodeSpanToken = Tokens.Codespan;
export type MarkdownCodeToken = Tokens.Code & { lines?: string[] };
export type MarkdownTableToken = Tokens.Table;

export interface PdfStyle {
  font: string | null;
  lineDistance: number;
  startWidth: number;
  startHeight: number;
  indent: number;
  blockColor: string;
  currentWidth: number;
  currentHeight: number;
  cursorIndex: number;
  fontSize: number;
  textColor: string;
  linkColor: string;
  drawColor: string;
  lineSpc: number;
  maxLineWidth: number;
  pageHeight: number;
  bold: boolean;
  italics: boolean;
  italic?: boolean;
  strike: boolean;
  code: boolean;
  link: string | null;
  skipParagraphBreak: boolean;
}

export interface JsPdfDoc {
  addPage: () => void;
  line: (...args: any[]) => void;
  rect: (...args: any[]) => void;
  text: (...args: any[]) => void;
  textWithLink: (...args: any[]) => void;
  setFont: (...args: any[]) => void;
  setFontSize: (size: number) => void;
  setTextColor: (color: string) => void;
  setDrawColor: (color: string) => void;
  splitTextToSize: (text: string, maxLineWidth: number) => string[];
  getTextWidth: (text: string) => number;
}

export interface MarkdownToPdfContext {
  style: PdfStyle;
  styleStack: PdfStyle[];
  getDoc: () => JsPdfDoc;
  setDoc: (doc: JsPdfDoc) => void;
  getStyle: () => PdfStyle;
  setStyle: (style: PdfStyle) => void;
  getStyleStack: () => PdfStyle[];
  setStyleStack: (styleStack: PdfStyle[]) => void;
  pushStyle: () => void;
  popStyle: () => void;
  updateStyle: (partial?: Partial<PdfStyle>) => void;
  setTextStyle: (type: string) => void;
  writeText: (text: string) => PdfStyle;
  writePrefix: (token: MarkdownListItemToken | MarkdownCheckboxToken) => PdfStyle;
  lineBreak: (distance: number) => void;
  horizontalLine: () => void;
  processTable: (token: MarkdownTableToken) => void;
  writeLink: (token: MarkdownLinkToken) => void;
  writeCheckBox: (token: MarkdownCheckboxToken) => void;
  writeList: (token: MarkdownListToken) => void;
  writeListItem: (token: MarkdownListItemToken) => void;
  writeCode: (token: MarkdownCodeToken) => void;
  writeCodeSpan: (token: MarkdownCodeSpanToken) => void;
  writeBlockquote: (token: MarkdownBlockquoteToken) => void;
  writeHeading: (token: MarkdownHeadingToken) => void;
  processParent: (token: MarkdownToken) => void;
  processChild: (token: MarkdownToken) => void;
  DFS: (tokens: MarkdownToken[]) => void;
  setDocStyle: (doc: JsPdfDoc, text: string, style: PdfStyle) => void;
}
