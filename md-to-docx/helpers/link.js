const docx = require("./docx");

function writeLink(token) {
  const currentTextRuns = this.getCurrentTextRuns();
  // save the current state of the document and start a new one for the link
  const state = currentTextRuns.slice();
  this.setCurrentTextRuns([]);

  this.updateStyle({ link: token.href, textColor: this.style.linkColor });

  // traverse child tokens to build the link text
  if (token.tokens) {
    this.DFS(token.tokens);
  }
  // write title if it exists
  if (token.title) {
    this.writeText(` (${token.title})`);
  }

  const linkChildren = this.getCurrentTextRuns();
  const link = new docx.ExternalHyperlink({
    children: linkChildren,
    link: token.href,
  });

  // restore the previous state of the document and add the link
  const restored = state.slice();
  restored.push(link);
  this.setCurrentTextRuns(restored);
}

module.exports = { writeLink };