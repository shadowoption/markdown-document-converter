const { writeHeading } = require("../../helpers/heading");
const { getDefaultStyle, pushStyle, popStyle } = require("../../helpers/style");

describe("md-to-pdf heading helper", () => {
  it("should increase height and apply heading style", () => {
    const context = {
      style: getDefaultStyle({ currentHeight: 70, fontSize: 10, bold: false, lineSpc: 18 }),
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
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      DFS: jest.fn(),
    };

    const before = context.style.currentHeight;
    writeHeading.call(context, { depth: 2, tokens: [] });

    expect(context.style.currentHeight).toBeGreaterThan(before);
    expect(context.style.bold).toBe(true);
    expect(context.style.fontSize).toBe(25);
  });

  it("should handle heading token without tokens", () => {
    const context = {
      style: getDefaultStyle({ currentHeight: 70, fontSize: 10, bold: false, lineSpc: 18 }),
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
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      DFS: jest.fn(),
    };

    writeHeading.call(context, { depth: 1 });

    expect(context.DFS).toHaveBeenCalledWith([]);
  });
});
