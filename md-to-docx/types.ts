import type { Token, Tokens, TokensList } from "marked";

export type DocxAlignment = (typeof import("docx").AlignmentType)[keyof typeof import("docx").AlignmentType];
export type DocxHeadingLevel = (typeof import("docx").HeadingLevel)[keyof typeof import("docx").HeadingLevel];
export type DocxParagraphChild = import("docx").ParagraphChild;
export type DocxBlock = import("docx").Paragraph | import("docx").Table;

export type MarkdownToken = Token;
export type MarkdownTokensList = TokensList;
export type MarkdownGenericToken = Tokens.Generic;
export type MarkdownHeadingToken = Tokens.Heading;
export type MarkdownBlockquoteToken = Tokens.Blockquote;
export type MarkdownLinkToken = Tokens.Link | Tokens.Image;
export type MarkdownCheckboxToken = Tokens.Checkbox | Tokens.ListItem;
// Extend ListItem with a prefix for our purposes
export type MarkdownListItemToken = Tokens.ListItem & { prefix?: string };
// Since we extend ListItem, we need to redefine List to use our extended ListItem
export type MarkdownListToken = Omit<Tokens.List, "items"> & { items: MarkdownListItemToken[] };
export type MarkdownCodeSpanToken = Tokens.Codespan;
export type MarkdownCodeToken = Tokens.Code & { lines?: string[] };
export type MarkdownTableToken = Tokens.Table;

export interface MarkdownStyle {
  font: string;
  textColor: string;
  linkColor: string;
  blockColor: string;
  fontSize: number;
  indentLevel: number;
  headingLevel: DocxHeadingLevel | null;
  link: string | null;
  bold: boolean;
  italics: boolean;
  strike: boolean;
  code: boolean;
  quote: boolean;
  ordered: boolean;
  prefix?: string;
}

export interface MarkdownToDocxContext {
  style: MarkdownStyle;
  styleStack: MarkdownStyle[];
  getCurrentTextRuns: () => DocxParagraphChild[];
  setCurrentTextRuns: (currentTextRuns: DocxParagraphChild[]) => DocxParagraphChild[];
  getParagraphs: () => DocxBlock[];
  setParagraphs: (paragraphs: DocxBlock[]) => DocxBlock[];
  pushStyle: () => void;
  popStyle: () => void;
  updateStyle: (partial?: Partial<MarkdownStyle>) => void;
  setTextStyle: (type: string) => void;
  getSpaceBreakCount: (token: MarkdownToken) => number;
  writeText: (text: string) => void;
  lineBreak: () => void;
  groupParagraph: () => void;
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
}
