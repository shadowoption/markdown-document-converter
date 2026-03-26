const { MarkdownToPdf } = require("./MarkdownToPdf");

const createMdToPdf = () => {
  return {
    convert(doc, text, style = {}) {
      const converter = new MarkdownToPdf(style);
      return converter.convert(doc, text);
    },
  };
};

module.exports = createMdToPdf;
