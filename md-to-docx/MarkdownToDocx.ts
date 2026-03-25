const marked = require("marked");
const he = require("he");

import {
  getDefaultStyle,
  getHeadingMap,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
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

export class MarkdownToDocx {
  private currentTextRuns: DocxParagraphChild[];
  private paragraphs: DocxBlock[];
  public style: MarkdownStyle;
  public styleStack: MarkdownStyle[];

  public pushStyle: () => void;
  public popStyle: () => void;
  public updateStyle: (partial?: Partial<MarkdownStyle>) => void;
  public setTextStyle: (type: string) => void;
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
    this.currentTextRuns = [];
    // list of paragraphs to be returned at the end
    this.paragraphs = [];
    // current style (initially default, updated as we traverse the tree)
    this.style = getDefaultStyle();
    // stack to keep track of styles as we traverse the tree (push on entry, pop on exit)
    this.styleStack = [];

    // bind helpers to instance (keeps bodies unchanged)
    this.pushStyle = pushStyle.bind(this);
    this.popStyle = popStyle.bind(this);
    this.updateStyle = updateStyle.bind(this);
    this.setTextStyle = setTextStyle.bind(this);
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
    const tokens: MarkdownTokensList = marked.lexer(text, { gfm: true, breaks: true });

    // decode HTML text and split code lines
    marked.walkTokens(tokens, (token: MarkdownToken) => {
      if ("text" in token && typeof token.text === "string") {
        token.text = he.decode(token.text);
      }
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
