function writeLink(token) {
  const prev = this.getStyle();
  this.updateStyle({
    textColor: "#0000EE",
    link: token.href || null,
  });

  if (Array.isArray(token.tokens) && token.tokens.length > 0) {
    this.DFS(token.tokens);
  } else {
    this.writeText(token.text || "");
  }

  if (token.title) {
    this.writeText(` (${token.title})`);
  }

  this.updateStyle({
    textColor: prev.textColor,
    link: prev.link,
  });
}

module.exports = {
  writeLink,
};
