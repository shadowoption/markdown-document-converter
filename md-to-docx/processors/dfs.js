function hasChildren(token) {
  return Object.hasOwn(token, "tokens") && Array.isArray(token.tokens);
}

function DFS(tokens) {
  for (const t of tokens) {
    if (hasChildren(t)) {
      this.processParent(t);
    } else {
      this.processChild(t);
    }
  }
}

module.exports = { DFS };