const docx = require("./docx");

function groupParagraph() {
  const currentTextRuns = this.getCurrentTextRuns();
  if (currentTextRuns.length === 0) return;

  const options = {
    children: currentTextRuns,
  };

  if (this.style.headingLevel) {
    options.heading = this.style.headingLevel;
  }

  if (this.style.quote) {
    options.border = {
      left: {
        color: this.style.blockColor,
        space: 4,
        style: "single",
        size: Math.floor(this.style.fontSize / 2),
      },
    };
  }

  if (this.style.code) {
    const border = {
      color: this.style.blockColor,
      space: 4,
      style: "single",
      size: Math.floor(this.style.fontSize / 2),
    };
    options.border = {
      left: border,
      right: border,
      top: border,
      bottom: border,
    };
  }

  if (this.style.indentLevel > 0) {
    options.indent = {
      left: this.style.indentLevel * this.style.fontSize * 10,
    };
  }

  const paragraphs = this.getParagraphs();
  paragraphs.push(new docx.Paragraph(options));
  this.setParagraphs(paragraphs);
  this.setCurrentTextRuns([]);
}

module.exports = { groupParagraph };