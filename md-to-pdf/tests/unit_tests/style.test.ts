const {
  getDefaultStyle,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
  checkHeight,
  setDocStyle,
} = require("../../helpers/style");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf style helpers", () => {
  it("should return default style", () => {
    const style = getDefaultStyle();

    expect(style.fontSize).toBe(10);
    expect(style.textColor).toBe("#333333");
    expect(style.italics).toBe(false);
    expect(style.linkColor).toBe("#0000EE");
  });

  it("should merge default style overrides", () => {
    const style = getDefaultStyle({ fontSize: 18, textColor: "#111" });

    expect(style.fontSize).toBe(18);
    expect(style.textColor).toBe("#111");
  });

  it("should push and pop style stack", () => {
    const context = {
      style: getDefaultStyle({ bold: false }),
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
    };

    pushStyle.call(context);
    context.style.bold = true;
    popStyle.call(context);

    expect(context.style.bold).toBe(false);
  });

  it("should preserve currentHeight and restore currentWidth when popping style", () => {
    const context = {
      style: getDefaultStyle({ currentHeight: 150, currentWidth: 77, cursorIndex: 80 }),
      styleStack: [getDefaultStyle({ currentHeight: 70, currentWidth: 60, cursorIndex: 60, bold: true })],
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
    };

    popStyle.call(context);

    expect(context.style.currentHeight).toBe(150);
    expect(context.style.currentWidth).toBe(60);
    expect(context.style.cursorIndex).toBe(80);
    expect(context.style.bold).toBe(true);
  });

  it("should throw on style stack underflow", () => {
    const context = {
      style: getDefaultStyle(),
      styleStack: [],
      getStyle() {
        return this.style;
      },
      setStyle() {},
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack() {},
    };

    expect(() => popStyle.call(context)).toThrow("Style stack underflow");
  });

  it("should update italics in updateStyle", () => {
    const context = {
      style: getDefaultStyle(),
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
    };

    updateStyle.call(context, { italics: true });
    expect(context.style.italics).toBe(true);

    updateStyle.call(context, { italics: false });
    expect(context.style.italics).toBe(false);
  });

  it("should set text styles", () => {
    const context = {
      style: getDefaultStyle(),
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      updateStyle(partial) {
        updateStyle.call(this, partial);
      },
    };

    setTextStyle.call(context, "strong");
    setTextStyle.call(context, "em");
    setTextStyle.call(context, "del");

    expect(context.style.bold).toBe(true);
    expect(context.style.italics).toBe(true);
    expect(context.style.strike).toBe(true);
  });

  it("checkHeight should add page and reset when overflow", () => {
    const doc = createMockDoc();
    const style = getDefaultStyle({ currentHeight: 780, lineSpc: 20, pageHeight: 790, startHeight: 70 });

    const result = checkHeight(doc, style);

    expect(doc.addPage).toHaveBeenCalled();
    expect(result).toBe(70);
  });

  it("setDocStyle should configure font, size, and text style", () => {
    const doc = createMockDoc();
    const style = getDefaultStyle({ fontSize: 12, bold: true, italics: true, font: "Times" });

    setDocStyle(doc, "hello", style);

    expect(doc.setFont).toHaveBeenCalledWith("Times");
    expect(doc.setFontSize).toHaveBeenCalledWith(12);
    expect(doc.setTextColor).toHaveBeenCalledWith(style.textColor);
    expect(doc.setDrawColor).toHaveBeenCalledWith(style.drawColor);
    expect(doc.setFont).toHaveBeenCalledWith("Times", "bolditalic");
  });
});
