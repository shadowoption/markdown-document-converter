const marked = require("marked");
const he = require("he");

// helpers
const {
  getDefaultStyle,
  getHeadingMap,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
} = require("./helpers/styles");
const { writeText } = require("./helpers/text");
const { horizontalLine, lineBreak } = require("./helpers/lines");
const { groupParagraph  } = require("./helpers/paragraph");
const { processTable } = require("./helpers/table");
const { writeLink } = require("./helpers/link");
const { writeCheckBox, writeList, writeListItem } = require("./helpers/list");
const { writeCode, writeCodeSpan } = require("./helpers/code");
const { writeBlockquote } = require("./helpers/blockquote");
const { writeHeading } = require("./helpers/heading");

// processors
const { processParent } = require("./processors/parent");
const { processChild } = require("./processors/child");
const { DFS } = require("./processors/dfs");


class MarkdownToDocx {
  // style parameter is optional, overrides default style
  constructor(style = {}) {
    // list of paragraphs to be returned at the end
    this.setParagraphs([]);
    // current text runs being processed for a paragraph
    this.setCurrentTextRuns([]);
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

  getDefaultStyle() {
    return getDefaultStyle();
  }

  getHeadingMap() {
    return getHeadingMap();
  }

  getCurrentTextRuns() {
    return this.currentTextRuns;
  }

  setCurrentTextRuns(currentTextRuns) {
    if (!Array.isArray(currentTextRuns)) {
      throw new Error("currentTextRuns must be an array");
    }
    this.currentTextRuns = currentTextRuns;
    return this.currentTextRuns;
  }

  getParagraphs() {
    return this.paragraphs;
  }

  setParagraphs(paragraphs) {
    if (!Array.isArray(paragraphs)) {
      throw new Error("paragraphs must be an array");
    }
    this.paragraphs = paragraphs;
    return this.paragraphs;
  }

  getStyle() {
    return this.style;
  }

  setStyle(style) {
    if (!style || typeof style !== "object" || Array.isArray(style)) {
      throw new Error("style must be an object");
    }
    this.style = style;
    return this.style;
  }

  getStyleStack() {
    return this.styleStack;
  }

  setStyleStack(styleStack) {
    if (!Array.isArray(styleStack)) {
      throw new Error("styleStack must be an array");
    }
    this.styleStack = styleStack;
    return this.styleStack;
  }

  convert(text) {
    // parse markdown text into tokens using marked (with GitHub-flavoured Markdown and line breaks enabled)
    const tokens = marked.lexer(text, { gfm: true, breaks: true });

    // decode HTML text and split code lines
    marked.walkTokens(tokens, (token) => {
      if (token.text) token.text = he.decode(token.text);
      if (token.type === "code") token.lines = token.text.split("\n");
    });

    // traverse the token tree and build paragraphs
    this.DFS(tokens);
    // group any trailing text runs into a paragraph
    this.groupParagraph();
    // return the list of paragraphs
    return this.getParagraphs();
  }
}

module.exports = { MarkdownToDocx };