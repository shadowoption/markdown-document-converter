const docx = require("docx");

function writeLink(token) {
  const state = this.current.slice();
  this.current = [];

  this.updateStyle({ link: token.href, textColor: this.style.linkColor });

  if (token.tokens) {
    this.DFS(token.tokens);
  }
  if (token.title) {
    this.writeText(` (${token.title})`);
  }

  const link = new docx.ExternalHyperlink({
    children: this.current,
    link: token.href,
  });

  this.current = state.slice();
  this.current.push(link);
}

module.exports = { writeLink };