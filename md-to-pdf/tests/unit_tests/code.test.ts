const { writeCode, writeCodeSpan } = require("../../helpers/code");
const { getDefaultStyle, pushStyle, popStyle } = require("../../helpers/style");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf code helpers", () => {
  it("should write code block and increase currentHeight", () => {
    const doc = createMockDoc();
    const context = {
      style: getDefaultStyle({ currentHeight: 70, lineDistance: 10, lineSpc: 18 }),
      styleStack: [],
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack(next) {
        this.styleStack = next;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      pushStyle,
      popStyle,
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      writeText: jest.fn(),
    };

    const before = context.style.currentHeight;
    writeCode.call(context, { lines: ["a", "b"], codeBlockStyle: false });

    expect(context.style.currentHeight).toBeGreaterThan(before);
    expect(doc.rect).toHaveBeenCalled();
  });

  it("should toggle code flag for inline code span", () => {
    const context = {
      style: getDefaultStyle({ code: false }),
      styleStack: [],
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack(next) {
        this.styleStack = next;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      pushStyle,
      popStyle,
      writeText: jest.fn(),
    };

    writeCodeSpan.call(context, { text: "const x = 1" });

    expect(context.writeText).toHaveBeenCalledWith("const x = 1");
    expect(context.style.code).toBe(true);
  });

  it("should apply indented code block style when codeBlockStyle is true", () => {
    const doc = createMockDoc();
    const context = {
      style: getDefaultStyle({ currentWidth: 60, indent: 8, currentHeight: 70, lineDistance: 10, lineSpc: 18 }),
      styleStack: [],
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack(next) {
        this.styleStack = next;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      pushStyle,
      popStyle,
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      writeText: jest.fn(),
    };

    writeCode.call(context, { lines: ["x"], codeBlockStyle: true });

    expect(context.style.currentWidth).toBe(68);
    expect(context.style.cursorIndex).toBe(68);
    expect(doc.rect).toHaveBeenCalled();
  });

  it("should handle code token without lines", () => {
    const doc = createMockDoc();
    const context = {
      style: getDefaultStyle({ currentHeight: 70, lineDistance: 10, lineSpc: 18 }),
      styleStack: [],
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack(next) {
        this.styleStack = next;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      pushStyle,
      popStyle,
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      writeText: jest.fn(),
    };

    writeCode.call(context, { codeBlockStyle: false });

    expect(context.writeText).not.toHaveBeenCalled();
    expect(doc.rect).toHaveBeenCalled();
  });
});
