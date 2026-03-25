const { getHeadingMap } = require("../helpers/styles");

function writeHeading(token) {
  const headingMap = getHeadingMap();
  this.groupParagraph();
  this.updateStyle({
    headingLevel: headingMap[token.depth] || null,
    bold: true,
  });
  this.DFS(token.tokens);
  this.groupParagraph();
  this.lineBreak();
}

module.exports = { writeHeading };