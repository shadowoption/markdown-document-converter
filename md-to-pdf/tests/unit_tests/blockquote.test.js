const { writeBlockquote } = require("../../helpers/blockquote");
const { getDefaultStyle } = require("../../helpers/style");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf blockquote helper", () => {
  it("should render blockquote line and preserve increased currentHeight", () => {
    const doc = createMockDoc();
    const context = {
      style: getDefaultStyle({ currentHeight: 70, currentWidth: 60, indent: 8, lineDistance: 10 }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
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
    expect(context.style.currentWidth).toBe(60);
  });

  it("should handle blockquote without tokens", () => {
    const doc = createMockDoc();
    const context = {
      style: getDefaultStyle({ currentHeight: 70, currentWidth: 60, indent: 8, lineDistance: 10 }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      DFS: jest.fn(),
    };

    writeBlockquote.call(context, {});

    expect(context.DFS).toHaveBeenCalledWith([]);
  });
});
