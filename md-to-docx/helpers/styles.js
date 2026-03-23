const docx = require("docx");

const DEFAULT_STYLE = {
  font: "Arial",
  textColor: "333333",
  linkColor: "0000EE",
  blockColor: "858585",
  prefix: "",

  fontSize: 22,
  indentLevel: 0,

  headingLevel: null,
  link: null,
  
  bold: false,
  italics: false,
  strike: false,
  code: false,
  quote: false,
  ordered: false,
};

const HEADING_MAP = [
  null,
  docx.HeadingLevel.HEADING_1,
  docx.HeadingLevel.HEADING_2,
  docx.HeadingLevel.HEADING_3,
  docx.HeadingLevel.HEADING_4,
  docx.HeadingLevel.HEADING_5,
  docx.HeadingLevel.HEADING_6,
];

// push the current style onto the stack
function pushStyle() {
  this.styleStack = this.styleStack || [];
  this.styleStack.push({ ...this.style });
}

// pop the last style from the stack and set it as the current style
function popStyle() {
  if (this.styleStack && this.styleStack.length > 0) {
    this.style = this.styleStack.pop();
  }
}

// update the current style with the given partial style
function updateStyle(partial = {}) {
  this.style = {
    ...this.style,
    ...partial,
  };
  this.style.indentSize = this.style.fontSize * 10;
}

// set text style based on the given type (e.g., "strong", "em", "del")
function setTextStyle(type) {
  switch (type) {
    case "strong":
      this.updateStyle({ bold: true });
      break;
    case "em":
      this.updateStyle({ italics: true });
      break;
    case "del":
      this.updateStyle({ strike: true });
      break;
    default:
      break;
  }
}

module.exports = {
  DEFAULT_STYLE,
  HEADING_MAP,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle
};