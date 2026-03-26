const marked = require("marked");
const he = require("he");

function parseMarkdownTokens(text) {
  const tokens = marked.lexer(text, { gfm: true, breaks: true });

  marked.walkTokens(tokens, (token) => {
    if (token.text) {
      token.text = he.decode(token.text);
    }

    if (token.type === "code") {
      token.lines = token.text.split("\n");
    }
  });

  return tokens;
}

module.exports = {
  parseMarkdownTokens,
};
