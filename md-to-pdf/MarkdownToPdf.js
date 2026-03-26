const {
  getDefaultStyle,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
  setDocStyle,
} = require("./helpers/style");
const { lineBreak, horizontalLine } = require("./helpers/lines");
const { writePrefix, writeText, writeToPDF } = require("./helpers/text");
const { processTable } = require("./helpers/table");
const { writeCheckBox, writeList, writeListItem } = require("./helpers/list");
const { writeCode, writeCodeSpan } = require("./helpers/code");
const { writeBlockquote } = require("./helpers/blockquote");
const { writeHeading } = require("./helpers/heading");
const { writeLink } = require("./helpers/link");
const { parseMarkdownTokens } = require("./helpers/tokens");
const { processParent } = require("./processors/parent");
const { processChild } = require("./processors/child");
const { DFS } = require("./processors/dfs");

class MarkdownToPdf {
  constructor(style = {}) {
    this.doc = null;
    this.style = getDefaultStyle();
    this.styleStack = [];

    this.setDocStyle = setDocStyle.bind(this);
    this.pushStyle = pushStyle.bind(this);
    this.popStyle = popStyle.bind(this);
    this.updateStyle = updateStyle.bind(this);
    this.setTextStyle = setTextStyle.bind(this);
    this.lineBreak = lineBreak.bind(this);
    this.horizontalLine = horizontalLine.bind(this);
    this.writePrefix = writePrefix.bind(this);
    this.writeText = writeText.bind(this);
    this.writeToPDF = writeToPDF.bind(this);
    this.processTable = processTable.bind(this);
    this.writeCheckBox = writeCheckBox.bind(this);
    this.writeList = writeList.bind(this);
    this.writeListItem = writeListItem.bind(this);
    this.writeCode = writeCode.bind(this);
    this.writeCodeSpan = writeCodeSpan.bind(this);
    this.writeBlockquote = writeBlockquote.bind(this);
    this.writeHeading = writeHeading.bind(this);
    this.writeLink = writeLink.bind(this);
    this.processParent = processParent.bind(this);
    this.processChild = processChild.bind(this);
    this.DFS = DFS.bind(this);

    this.updateStyle(style);
    if (Object.hasOwn(style, "textColor") && !Object.hasOwn(style, "drawColor")) {
      this.updateStyle({ drawColor: style.textColor });
    }
  }

  getDoc() {
    return this.doc;
  }

  setDoc(doc) {
    this.doc = doc;
  }

  getStyle() {
    return this.style;
  }

  setStyle(style) {
    this.style = style;
  }

  getStyleStack() {
    return this.styleStack;
  }

  setStyleStack(styleStack) {
    this.styleStack = styleStack;
  }

  getDefaultStyle() {
    return getDefaultStyle();
  }

  convert(doc, text) {
    this.setDoc(doc);
    this.setStyleStack([]);
    this.updateStyle({
      cursorIndex: this.getStyle().currentWidth,
    });

    const tokens = parseMarkdownTokens(text);
    this.DFS(tokens);

    return this.getStyle().currentHeight;
  }
}

module.exports = {
  MarkdownToPdf,
};
