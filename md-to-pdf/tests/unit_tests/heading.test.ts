const { writeHeading } = require("../../helpers/heading");
const { getDefaultStyle } = require("../../helpers/style");

describe("md-to-pdf heading helper", () => {
  it("should increase height and restore previous style after heading", () => {
    const context = {
      style: getDefaultStyle({ currentHeight: 70, fontSize: 10, bold: false, lineSpc: 18 }),
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

    const before = context.style.currentHeight;
    writeHeading.call(context, { depth: 2, tokens: [] });

    expect(context.style.currentHeight).toBeGreaterThan(before);
    expect(context.style.bold).toBe(false);
    expect(context.style.fontSize).toBe(10);
  });

  it("should handle heading token without tokens", () => {
    const context = {
      style: getDefaultStyle({ currentHeight: 70, fontSize: 10, bold: false, lineSpc: 18 }),
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

    writeHeading.call(context, { depth: 1 });

    expect(context.DFS).toHaveBeenCalledWith([]);
  });
});
