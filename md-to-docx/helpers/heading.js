const { HEADING_MAP } = require("../helpers/styles");
const docx = require("docx");

function writeHeading(token) {
  this.groupParagraph();
  this.updateStyle({
    headingLevel: HEADING_MAP[token.depth] || null,
    bold: true,
  });
  this.DFS(token.tokens);
  this.groupParagraph();
  this.breakLine();
}

module.exports = { writeHeading };