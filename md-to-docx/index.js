const { MarkdownToDocx } = require("./MarkdownToDocx");

module.exports = () => {
  return {
    convert(text, style = {}) {
      // create MarkdownToDocx instance with user-defined style, if any
      const doc = new MarkdownToDocx(style);
      // convert markdown text to docx paragraph array and return the result
      return doc.convert(text);
    },
  }
};