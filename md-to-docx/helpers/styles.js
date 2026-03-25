const docx = require("./docx");

const _DEFAULT_STYLE = {
  font: "Arial",
  textColor: "333333",
  linkColor: "0000EE",
  blockColor: "858585",
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

const _HEADING_MAP = [
  null,
  docx.HeadingLevel.HEADING_1,
  docx.HeadingLevel.HEADING_2,
  docx.HeadingLevel.HEADING_3,
  docx.HeadingLevel.HEADING_4,
  docx.HeadingLevel.HEADING_5,
  docx.HeadingLevel.HEADING_6,
];

function getDefaultStyle() {
  return { ..._DEFAULT_STYLE };
}

function getHeadingMap() {
  return [..._HEADING_MAP];
}

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
  else {
    throw new Error("Style stack underflow: no styles to pop");
  }
}

// update the current style with the given partial style
function updateStyle(partial = {}) {
  this.style = {
    ...this.style,
    ...partial,
  };
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
  getDefaultStyle,
  getHeadingMap,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle
};