function hasChildren(token) {
  return Object.hasOwn(token, "tokens") && Array.isArray(token.tokens);
}

function DFS(tokens) {
  for (const token of tokens) {
    if (hasChildren(token)) {
      this.processParent(token);
    } else {
      this.processChild(token);
    }
  }
}

module.exports = {
  DFS,
};
