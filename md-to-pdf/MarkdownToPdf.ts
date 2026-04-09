import {
  getDefaultStyle,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
  setDocStyle,
} from "./helpers/styles";
import { horizontalLine, lineBreak } from "./helpers/lines";
import { writePrefix, writeText } from "./helpers/text";
import { processTable } from "./helpers/table";
import { writeCheckBox, writeList, writeListItem } from "./helpers/list";
import { writeCode, writeCodeSpan } from "./helpers/code";
import { writeBlockquote } from "./helpers/blockquote";
import { writeHeading } from "./helpers/heading";
import { writeLink } from "./helpers/link";
import { writeParagraph } from "./helpers/paragraph";

import { processParent } from "./processors/parent";
import { processChild } from "./processors/child";
import { DFS } from "./processors/dfs";
import he = require("he");
import marked = require("marked");


import type {
  JsPdfDoc,
  MarkdownBlockquoteToken,
  MarkdownCheckboxToken,
  MarkdownCodeSpanToken,
  MarkdownCodeToken,
  MarkdownHeadingToken,
  MarkdownParagraphToken,
  MarkdownLinkToken,
  MarkdownListItemToken,
  MarkdownListToken,
  MarkdownTableToken,
  MarkdownToken,
  MarkdownTokensList,
  PdfStyle,
} from "./types";

function normalizeMarkdownInput(text: string): string {
  return he.decode(String(text || ""))
    // Normalize line endings first.
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    // Normalize equivalent Unicode spacing characters often produced by HTML-to-text pipelines.
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/\u00AD/g, "")
    .replace(/[\u2010\u2011\u2212]/g, "-")
    // Arrow symbols frequently come from HTML entities and can render as
    // corrupted glyphs in some PDF font paths, so map them to ASCII fallbacks.
    .replace(/[\u2190\u21D0]/g, "<-")
    .replace(/[\u2191\u21D1]/g, "^")
    .replace(/[\u2192\u21D2]/g, "->")
    .replace(/[\u2193\u21D3]/g, "v")
    .replace(/[\u2194\u21D4]/g, "<->")
    // Drop invisible/control characters that commonly corrupt markdown parsing.
    .replace(/[\u0000\u200B\u2060\uFEFF]/g, "");
}

export class MarkdownToPdf {
  private doc: JsPdfDoc | null;
  public style: PdfStyle;
  public styleStack: PdfStyle[];

  public pushStyle: () => void;
  public popStyle: () => void;
  public updateStyle: (partial?: Partial<PdfStyle>) => void;
  public setTextStyle: (type: string) => void;
  public lineBreak: (distance: number) => void;
  public horizontalLine: () => void;
  public writePrefix: (token: MarkdownListItemToken | MarkdownCheckboxToken) => PdfStyle;
  public writeText: (text: string) => PdfStyle;
  public processTable: (token: MarkdownTableToken) => void;
  public writeLink: (token: MarkdownLinkToken) => void;
  public writeCheckBox: (token: MarkdownCheckboxToken) => void;
  public writeList: (token: MarkdownListToken) => void;
  public writeListItem: (token: MarkdownListItemToken) => void;
  public writeCode: (token: MarkdownCodeToken) => void;
  public writeCodeSpan: (token: MarkdownCodeSpanToken) => void;
  public writeBlockquote: (token: MarkdownBlockquoteToken) => void;
  public writeHeading: (token: MarkdownHeadingToken) => void;
  public writeParagraph: (token: MarkdownParagraphToken) => void;
  public processParent: (token: MarkdownToken) => void;
  public processChild: (token: MarkdownToken) => void;
  public DFS: (tokens: MarkdownToken[]) => void;
  public setDocStyle: (doc: JsPdfDoc, text: string, style: PdfStyle) => void;

  // style parameter is optional, overrides default style
  constructor(style: Partial<PdfStyle> = {}) {
    // current jsPDF document reference
    this.doc = null as JsPdfDoc | null;
    // current style (initially default, updated as we traverse the tree)
    this.style = getDefaultStyle();
    // stack to keep track of styles as we traverse the tree (push on entry, pop on exit)
    this.styleStack = [] as PdfStyle[];

    // bind helpers to instance (keeps bodies unchanged)
    this.setDocStyle = setDocStyle.bind(this);
    this.pushStyle = pushStyle.bind(this);
    this.popStyle = popStyle.bind(this);
    this.updateStyle = updateStyle.bind(this);
    this.setTextStyle = setTextStyle.bind(this);
    this.lineBreak = lineBreak.bind(this);
    this.horizontalLine = horizontalLine.bind(this);
    this.writePrefix = writePrefix.bind(this);
    this.writeText = writeText.bind(this);
    this.processTable = processTable.bind(this);
    this.writeCheckBox = writeCheckBox.bind(this);
    this.writeList = writeList.bind(this);
    this.writeListItem = writeListItem.bind(this);
    this.writeCode = writeCode.bind(this);
    this.writeCodeSpan = writeCodeSpan.bind(this);
    this.writeBlockquote = writeBlockquote.bind(this);
    this.writeHeading = writeHeading.bind(this);
    this.writeLink = writeLink.bind(this);
    this.writeParagraph = writeParagraph.bind(this);

    // bind processors
    this.processParent = processParent.bind(this);
    this.processChild = processChild.bind(this);
    this.DFS = DFS.bind(this);

    // apply initial style overrides
    this.updateStyle(style);
    if (
      Object.prototype.hasOwnProperty.call(style, "textColor") &&
      !Object.prototype.hasOwnProperty.call(style, "drawColor")
    ) {
      this.updateStyle({ drawColor: style.textColor });
    }
  }

  getDoc(): JsPdfDoc {
    if (!this.doc) {
      throw new Error("doc is not set");
    }
    return this.doc;
  }

  setDoc(doc: JsPdfDoc): void {
    this.doc = doc;
  }

  getStyle(): PdfStyle {
    return this.style;
  }

  setStyle(style: PdfStyle): void {
    this.style = style;
  }

  getStyleStack(): PdfStyle[] {
    return this.styleStack;
  }

  setStyleStack(styleStack: PdfStyle[]): void {
    this.styleStack = styleStack;
  }

  getDefaultStyle(): PdfStyle {
    return getDefaultStyle();
  }

  convert(doc: JsPdfDoc, text: string): number {
    // parse markdown text into tokens using marked (with GitHub-flavoured Markdown and line breaks enabled)
    /*
    const exampleTokens = [
      {
        type: 'heading',
        raw: '## Emphasis\n\n',
        depth: 2,
        text: 'Emphasis',
        tokens: [
          {
            type: 'text',
            raw: '## Emphasis\n\n',
            text: 'Emphasis',
            escaped: false
          }
        ]
      },
      {
        type: 'paragraph',
        raw: '**This is bold text**',
        text: '**This is bold text**',
        tokens: [
          {
            type: 'strong',
            raw: '**This is bold text**',
            text: 'This is bold text',
            tokens: [
              {
                type: 'text',
                raw: 'This is bold text',
                text: 'This is bold text',
                escaped: false
              }
            ]
          }
        ]
      },
      { type: 'space', raw: '\n\n' },
      {
        type: 'paragraph',
        raw: '*This is italic text*',
        text: '*This is italic text*',
        tokens: [
          {
            type: 'em',
            raw: '*This is italic text*',
            text: 'This is italic text',
            tokens: [
              {
                type: 'text',
                raw: 'This is italic text',
                text: 'This is italic text',
                escaped: false
              }
            ]
          }
        ]
      },
    ]
      */
    const normalizedText = normalizeMarkdownInput(text);

    // set the active document and reset traversal style stack
    this.setDoc(doc);
    this.setStyleStack([]);
    this.updateStyle({
      cursorIndex: this.getStyle().currentWidth,
    });

    // parse markdown text into tokens using marked (with GitHub-flavoured Markdown and line breaks enabled)
    const tokens: MarkdownTokensList = marked.lexer(normalizedText, { gfm: true, breaks: true });

    // decode HTML text and split code lines
    marked.walkTokens(tokens, (token: MarkdownToken) => {
      if ("text" in token && typeof token.text === "string") {
        token.text = he.decode(token.text);
      }
      if (token.type === "code" && "text" in token && typeof token.text === "string") {
        (token as MarkdownCodeToken).lines = token.text.split("\n");
      }
    });

    // traverse the token tree and render to jsPDF
    this.DFS(tokens);

    // return the final vertical cursor position
    return this.getStyle().currentHeight;
  }
}
