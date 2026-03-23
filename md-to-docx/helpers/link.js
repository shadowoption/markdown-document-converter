const docx = require("docx");

function writeLink(token) {
  // save the current state of the document and start a new one for the link
  const state = this.current.slice();
  this.current = [];

  this.updateStyle({ link: token.href, textColor: this.style.linkColor });

  // traverse child tokens to build the link text
  if (token.tokens) {
    this.DFS(token.tokens);
  }
  // write title if it exists
  if (token.title) {
    this.writeText(` (${token.title})`);
  }

  const link = new docx.ExternalHyperlink({
    children: this.current,
    link: token.href,
  });

  // restore the previous state of the document and add the link
  this.current = state.slice();
  this.current.push(link);
}

module.exports = { writeLink };