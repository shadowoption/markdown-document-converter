const { writeCheckBox, writeList, writeListItem } = require("../../helpers/list");
const { getDefaultStyle, pushStyle, popStyle } = require("../../helpers/style");

describe("md-to-pdf list helpers", () => {
  it("writeCheckBox should write checked prefix", () => {
    const context = {
      writePrefix: jest.fn(),
    };
    const token = { checked: true };

    writeCheckBox.call(context, token);

    expect(token.prefix).toBe("[X] ");
    expect(context.writePrefix).toHaveBeenCalledWith(token);
  });

  it("writeCheckBox should write unchecked prefix", () => {
    const context = {
      writePrefix: jest.fn(),
    };
    const token = { checked: false };

    writeCheckBox.call(context, token);

    expect(token.prefix).toBe("[ ] ");
    expect(context.writePrefix).toHaveBeenCalledWith(token);
  });

  it("writeList should set ordered prefixes and restore width", () => {
    const style = getDefaultStyle({ currentWidth: 60, cursorIndex: 60, currentHeight: 80, indent: 8 });
    const context = {
      style,
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
      DFS: jest.fn(),
    };

    const token = {
      ordered: true,
      start: 3,
      items: [{ tokens: [] }, { tokens: [] }],
    };

    writeList.call(context, token);

    expect(token.items[0].prefix).toBe("3. ");
    expect(token.items[1].prefix).toBe("4. ");
    expect(context.style.currentWidth).toBe(68);
    expect(context.DFS).toHaveBeenCalledTimes(2);
  });

  it("writeList should default ordered start to 1 when start is invalid", () => {
    const style = getDefaultStyle({ currentWidth: 60, cursorIndex: 60, currentHeight: 80, indent: 8 });
    const context = {
      style,
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
      DFS: jest.fn(),
    };

    const token = {
      ordered: true,
      start: "NaN",
      items: [{ tokens: [] }],
    };

    writeList.call(context, token);

    expect(token.items[0].prefix).toBe("1. ");
  });

  it("writeListItem should create line break and set skipParagraphBreak", () => {
    const context = {
      style: getDefaultStyle({ lineDistance: 10, lineSpc: 18 }),
      getStyle() {
        return this.style;
      },
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      writePrefix: jest.fn(),
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      DFS: jest.fn(),
    };

    const before = context.style.currentHeight;
    const token = { loose: false, task: true, checked: false, prefix: "1. ", tokens: [] };

    writeListItem.call(context, token);

    expect(context.lineBreak).toHaveBeenCalledWith(10);
    expect(context.style.currentHeight).toBeGreaterThan(before);
    expect(token.prefix).toBe("1. [ ] ");
    expect(context.style.skipParagraphBreak).toBe(true);
  });

  it("writeList should set bullet prefixes for unordered list", () => {
    const style = getDefaultStyle({ currentWidth: 60, cursorIndex: 60, currentHeight: 80, indent: 8 });
    const context = {
      style,
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
      DFS: jest.fn(),
    };

    const token = {
      ordered: false,
      items: [{ tokens: [] }, { tokens: [] }],
    };

    writeList.call(context, token);

    expect(token.items[0].prefix).toBe("• ");
    expect(token.items[1].prefix).toBe("• ");
  });

  it("writeListItem should not append checkbox prefix when task is false", () => {
    const context = {
      style: getDefaultStyle({ lineDistance: 10, lineSpc: 18 }),
      getStyle() {
        return this.style;
      },
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      writePrefix: jest.fn(),
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      DFS: jest.fn(),
    };

    const token = { loose: true, task: false, prefix: "2. ", tokens: [] };
    writeListItem.call(context, token);

    expect(context.lineBreak).toHaveBeenCalledWith(18);
    expect(token.prefix).toBe("2. ");
  });

  it("writeListItem should fallback to empty tokens array", () => {
    const context = {
      style: getDefaultStyle({ lineDistance: 10, lineSpc: 18 }),
      getStyle() {
        return this.style;
      },
      lineBreak: jest.fn(function(distance) {
        this.style.currentHeight += distance;
      }),
      writePrefix: jest.fn(),
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      DFS: jest.fn(),
    };

    writeListItem.call(context, { loose: false, task: false, prefix: "• " });

    expect(context.DFS).toHaveBeenCalledWith([]);
  });
});
