const docx = require("./docx");

function writeLink(token) {
  const current = this.getCurrent();
  // save the current state of the document and start a new one for the link
  const state = current.slice();
  this.setCurrent([]);

  this.updateStyle({ link: token.href, textColor: this.style.linkColor });

  // traverse child tokens to build the link text
  if (token.tokens) {
    this.DFS(token.tokens);
  }
  // write title if it exists
  if (token.title) {
    this.writeText(` (${token.title})`);
  }

  const linkChildren = this.getCurrent();
  const link = new docx.ExternalHyperlink({
    children: linkChildren,
    link: token.href,
  });

  // restore the previous state of the document and add the link
  const restored = state.slice();
  restored.push(link);
  this.setCurrent(restored);
}

module.exports = { writeLink };