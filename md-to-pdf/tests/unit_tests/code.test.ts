const { writeCode, writeCodeSpan } = require("../../helpers/code");
const { getDefaultStyle, pushStyle, popStyle } = require("../../helpers/styles");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf code helpers", () => {
  it("should write code block and increase currentHeight", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, lineDistance: 10, lineSpc: 18 } }),
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

  it("should draw the code block border above the first line baseline", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, lineDistance: 10, lineSpc: 18 } }),
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

    writeCode.call(context, { lines: ["a"], codeBlockStyle: false });

    expect(doc.rect).toHaveBeenCalledWith(60, 70, 440, 28);
  });

  it("should toggle code flag for inline code span", () => {
    const context = {
      style: ({ ...getDefaultStyle(), ...{ code: false } }),
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
      style: ({ ...getDefaultStyle(), ...{ currentWidth: 60, indent: 8, currentHeight: 70, lineDistance: 10, lineSpc: 18 } }),
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
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, lineDistance: 10, lineSpc: 18 } }),
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

  it("should start the code block on the next page when the opening line break overflows", () => {
    let currentPage = 1;
    let breakCalls = 0;
    const doc = createMockDoc({
      getCurrentPageInfo: jest.fn(() => ({ pageNumber: currentPage })),
      setPage: jest.fn((page) => {
        currentPage = page;
      }),
    });
    const context = {
      style: ({
        ...getDefaultStyle(),
        ...{ currentHeight: 760, startHeight: 70, pageHeight: 780, lineDistance: 10, lineSpc: 18 },
      }),
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
        breakCalls += 1;
        if (breakCalls === 1) {
          currentPage = 2;
          this.style.currentHeight = this.style.startHeight;
          return;
        }

        this.style.currentHeight += distance;
      }),
      writeText: jest.fn(function() {
        this.style.currentHeight += 20;
      }),
    };

    writeCode.call(context, { lines: ["const a = 1;"], codeBlockStyle: false });

    expect(doc.setPage).not.toHaveBeenCalled();
    expect(doc.rect).toHaveBeenCalledWith(60, 52, 440, 48);
  });
});
