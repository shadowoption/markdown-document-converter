const { MarkdownToDocx } = require("./MarkdownToDocx");

module.exports = () => {
  return {
    convert(text, style = {}) {
      const doc = new MarkdownToDocx(style);
      return doc.convert(text);
    },
  }
};