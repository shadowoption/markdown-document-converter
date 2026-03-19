const docx = require("docx");

function groupParagraph() {
  if (this.current.length === 0) return;

  const options = {
    children: this.current,
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
      left: this.style.indentLevel * this.style.indentSize,
    };
  }

  this.paragraphs.push(new docx.Paragraph(options));
  this.current = [];
}

module.exports = { groupParagraph };