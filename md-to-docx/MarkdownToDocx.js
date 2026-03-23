const marked = require("marked");
const he = require("he");

// helpers
const { DEFAULT_STYLE, pushStyle, popStyle, updateStyle, setTextStyle } = require("./helpers/styles");
const { writeText } = require("./helpers/text");
const { horizontalLine, breakLine } = require("./helpers/lines");
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
  // style parameter is optional, overrides default style (see DEFAULT_STYLE)
  constructor(style = {}) {
    // list of paragraphs to be returned at the end
    this.paragraphs = [];
    // current paragraph being processed (array of text runs)
    this.current = [];
    // current style (initially default, updated as we traverse the tree)
    this.style = { ...DEFAULT_STYLE };
    // stack to keep track of styles as we traverse the tree (push on entry, pop on exit)
    this.styleStack = [];

    // bind helpers to instance (keeps bodies unchanged)
    this.pushStyle = pushStyle.bind(this);
    this.popStyle = popStyle.bind(this);
    this.updateStyle = updateStyle.bind(this);
    this.setTextStyle = setTextStyle.bind(this);
    this.writeText = writeText.bind(this);
    this.breakLine = breakLine.bind(this);
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

    // apply initial style (computes indentSize)
    this.updateStyle(style);
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
    return this.paragraphs;
  }
}

module.exports = { MarkdownToDocx };