const marked = require("marked");
const he = require("he");

import {
  getDefaultStyle,
  getHeadingMap,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
  getSpaceBreakCount,
} from "./helpers/styles";
import { writeText } from "./helpers/text";
import { horizontalLine, lineBreak } from "./helpers/lines";
import { groupParagraph } from "./helpers/paragraph";
import { processTable } from "./helpers/table";
import { writeLink } from "./helpers/link";
import { writeCheckBox, writeList, writeListItem } from "./helpers/list";
import { writeCode, writeCodeSpan } from "./helpers/code";
import { writeBlockquote } from "./helpers/blockquote";
import { writeHeading } from "./helpers/heading";

import { processParent } from "./processors/parent";
import { processChild } from "./processors/child";
import { DFS } from "./processors/dfs";

import type {
  DocxBlock,
  DocxHeadingLevel,
  DocxParagraphChild,
  MarkdownBlockquoteToken,
  MarkdownCheckboxToken,
  MarkdownCodeSpanToken,
  MarkdownCodeToken,
  MarkdownHeadingToken,
  MarkdownLinkToken,
  MarkdownListItemToken,
  MarkdownListToken,
  MarkdownStyle,
  MarkdownTableToken,
  MarkdownToken,
  MarkdownTokensList,
} from "./types";

// Matches non-printing control/format characters that can destabilize
// markdown tokenization or produce noisy output in generated documents.
const INVISIBLE_FORMAT_AND_CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD\p{Cf}\p{Cs}\u034F]/gu;

function normalizeMarkdownInput(text: string): string {
  // Decode entities once here (before lexing) so parsing and output are based
  // on one canonical input string. We intentionally avoid per-token decode.
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
    .replace(INVISIBLE_FORMAT_AND_CONTROL_RE, "");
}

export class MarkdownToDocx {
  private currentTextRuns: DocxParagraphChild[];
  private paragraphs: DocxBlock[];
  public style: MarkdownStyle;
  public styleStack: MarkdownStyle[];

  public pushStyle: () => void;
  public popStyle: () => void;
  public updateStyle: (partial?: Partial<MarkdownStyle>) => void;
  public setTextStyle: (type: string) => void;
  public getSpaceBreakCount: (token: MarkdownToken) => number;
  public writeText: (text: string) => void;
  public lineBreak: () => void;
  public groupParagraph: () => void;
  public horizontalLine: () => void;
  public processTable: (token: MarkdownTableToken) => void;
  public writeLink: (token: MarkdownLinkToken) => void;
  public writeCheckBox: (token: MarkdownCheckboxToken) => void;
  public writeList: (token: MarkdownListToken) => void;
  public writeListItem: (token: MarkdownListItemToken) => void;
  public writeCode: (token: MarkdownCodeToken) => void;
  public writeCodeSpan: (token: MarkdownCodeSpanToken) => void;
  public writeBlockquote: (token: MarkdownBlockquoteToken) => void;
  public writeHeading: (token: MarkdownHeadingToken) => void;
  public processParent: (token: MarkdownToken) => void;
  public processChild: (token: MarkdownToken) => void;
  public DFS: (tokens: MarkdownToken[]) => void;

  // style parameter is optional, overrides default style
  constructor(style: Partial<MarkdownStyle> = {}) {
    // current text runs being processed for a paragraph
    this.currentTextRuns = [] as DocxParagraphChild[];
    // list of paragraphs to be returned at the end
    this.paragraphs = [] as DocxBlock[];
    // current style (initially default, updated as we traverse the tree)
    this.style = getDefaultStyle();
    // stack to keep track of styles as we traverse the tree (push on entry, pop on exit)
    this.styleStack = [] as MarkdownStyle[];

    // bind helpers to instance (keeps bodies unchanged)
    this.pushStyle = pushStyle.bind(this);
    this.popStyle = popStyle.bind(this);
    this.updateStyle = updateStyle.bind(this);
    this.setTextStyle = setTextStyle.bind(this);
    this.getSpaceBreakCount = getSpaceBreakCount.bind(this);
    this.writeText = writeText.bind(this);
    this.lineBreak = lineBreak.bind(this);
    this.groupParagraph = groupParagraph.bind(this);
    this.horizontalLine = horizontalLine.bind(this);
    this.processTable = processTable.bind(this);
    this.writeLink = writeLink.bind(this);
    this.writeCheckBox = writeCheckBox.bind(this);
    this.writeList = writeList.bind(this);
    this.writeListItem = writeListItem.bind(this);
    this.writeCode = writeCode.bind(this);
    this.writeCodeSpan = writeCodeSpan.bind(this);
    this.writeBlockquote = writeBlockquote.bind(this);
    this.writeHeading = writeHeading.bind(this);

    // bind processors
    this.processParent = processParent.bind(this);
    this.processChild = processChild.bind(this);
    this.DFS = DFS.bind(this);

    // apply initial style overrides
    this.updateStyle(style);
  }

  getDefaultStyle(): MarkdownStyle {
    return getDefaultStyle();
  }

  getHeadingMap(): Array<DocxHeadingLevel | null> {
    return getHeadingMap();
  }

  getCurrentTextRuns(): DocxParagraphChild[] {
    return this.currentTextRuns;
  }

  setCurrentTextRuns(currentTextRuns: DocxParagraphChild[]): DocxParagraphChild[] {
    if (!Array.isArray(currentTextRuns)) {
      throw new Error("currentTextRuns must be an array");
    }
    this.currentTextRuns = currentTextRuns;
    return this.currentTextRuns;
  }

  getParagraphs(): DocxBlock[] {
    return this.paragraphs;
  }

  setParagraphs(paragraphs: DocxBlock[]): DocxBlock[] {
    if (!Array.isArray(paragraphs)) {
      throw new Error("paragraphs must be an array");
    }
    this.paragraphs = paragraphs;
    return this.paragraphs;
  }

  getStyle(): MarkdownStyle {
    return this.style;
  }

  setStyle(style: MarkdownStyle): MarkdownStyle {
    if (!style || typeof style !== "object" || Array.isArray(style)) {
      throw new Error("style must be an object");
    }
    this.style = style;
    return this.style;
  }

  getStyleStack(): MarkdownStyle[] {
    return this.styleStack;
  }

  setStyleStack(styleStack: MarkdownStyle[]): MarkdownStyle[] {
    if (!Array.isArray(styleStack)) {
      throw new Error("styleStack must be an array");
    }
    this.styleStack = styleStack;
    return this.styleStack;
  }

  convert(text: string): DocxBlock[] {
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
    // normalizeMarkdownInput handles entity decoding and aggressive cleanup
    // before marked.lexer, which keeps token content deterministic.
    const normalizedText = normalizeMarkdownInput(text);
    const tokens: MarkdownTokensList = marked.lexer(normalizedText, { gfm: true, breaks: true });

    // walkTokens is now only used for code-line preparation.
    // Text token decode/sanitize is intentionally pre-lexer.
    marked.walkTokens(tokens, (token: MarkdownToken) => {
      if (token.type === "code" && "text" in token && typeof token.text === "string") {
        (token as MarkdownCodeToken).lines = token.text.split("\n");
      }
    });

    // traverse the token tree and build paragraphs
    this.DFS(tokens);
    // group any trailing text runs into a paragraph
    this.groupParagraph();
    // return the list of paragraphs
    return this.getParagraphs();
  }
}
