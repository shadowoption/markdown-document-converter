const { writeBlockquote } = require("../../helpers/blockquote");
const { getDefaultStyle, pushStyle, popStyle } = require("../../helpers/styles");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf blockquote helper", () => {
  it("should render blockquote line and preserve increased currentHeight", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, currentWidth: 60, indent: 8, lineDistance: 10 } }),
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
      DFS: jest.fn(function() {
        this.style.currentHeight += 20;
      }),
    };

    const before = context.style.currentHeight;
    writeBlockquote.call(context, { tokens: [] });

    expect(context.style.currentHeight).toBeGreaterThan(before);
    expect(doc.line).toHaveBeenCalled();
    expect(context.style.currentWidth).toBe(68);
  });

  it("should handle blockquote without tokens", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, currentWidth: 60, indent: 8, lineDistance: 10 } }),
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
      DFS: jest.fn(),
    };

    writeBlockquote.call(context, {});

    expect(context.DFS).toHaveBeenCalledWith([]);
  });

  it("should draw blockquote line across first and second page", () => {
    let currentPage = 1;
    const doc = createMockDoc({
      getCurrentPageInfo: jest.fn(() => ({ pageNumber: currentPage })),
      setPage: jest.fn((page) => {
        currentPage = page;
      }),
    });
    const context = {
      style: ({
        ...getDefaultStyle(),
        ...{ currentHeight: 760, currentWidth: 60, indent: 8, lineDistance: 10, startHeight: 70, pageHeight: 780 },
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
      lineBreak: jest.fn(function() {
        this.style.currentHeight = this.style.startHeight;
      }),
      DFS: jest.fn(function() {
        currentPage = 2;
        this.style.currentHeight += 25;
      }),
    };

    writeBlockquote.call(context, { tokens: [] });

    expect(doc.setPage).toHaveBeenNthCalledWith(1, 1);
    expect(doc.line).toHaveBeenNthCalledWith(1, 60, 80, 60, 780, "S");
    expect(doc.setPage).toHaveBeenNthCalledWith(2, 2);
    expect(doc.line).toHaveBeenNthCalledWith(2, 60, 70, 60, 95, "S");
  });

  it("should start on new page when pre-break overflows", () => {
    let currentPage = 1;
    const doc = createMockDoc({
      getCurrentPageInfo: jest.fn(() => ({ pageNumber: currentPage })),
      setPage: jest.fn((page) => {
        currentPage = page;
      }),
    });
    const context = {
      style: ({
        ...getDefaultStyle(),
        ...{ currentHeight: 775, currentWidth: 60, indent: 8, lineDistance: 10, startHeight: 70, pageHeight: 780 },
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
      lineBreak: jest.fn(function() {
        currentPage = 2;
        this.style.currentHeight = this.style.startHeight;
      }),
      DFS: jest.fn(function() {
        this.style.currentHeight += 20;
      }),
    };

    writeBlockquote.call(context, { tokens: [] });

    expect(doc.setPage).not.toHaveBeenCalledWith(1);
    expect(doc.line).toHaveBeenCalledWith(60, 80, 60, 90, "S");
  });

  it("should align single-line blockquotes using the pre-break quote baseline", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, currentWidth: 60, indent: 8, lineDistance: 10 } }),
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
      DFS: jest.fn(function() {
        this.style.currentHeight += 15;
      }),
    };

    writeBlockquote.call(context, { tokens: [{ type: "text", text: "one line" }] });

    expect(doc.line).toHaveBeenCalledWith(60, 80, 60, 95, "S");
  });
});
