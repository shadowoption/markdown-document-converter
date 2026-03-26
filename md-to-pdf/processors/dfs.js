function hasChildren(token) {
  return Object.hasOwn(token, "tokens") && Array.isArray(token.tokens);
}

function DFS(tokens) {
  for (const token of tokens) {
    if (hasChildren(token)) {
      // parent node
      this.processParent(token);
    } else {
      // leaf/child node
      this.processChild(token);
    }
  }
}

module.exports = {
  DFS,
};
