jest.mock("../../jspdfFonts", () => ({
  chooseFontForText: jest.fn().mockReturnValue("mock-font"),
}));

const jspdfFonts = require("../../jspdfFonts");
const actualJspdfFonts = jest.requireActual("../../jspdfFonts");
const {
  getDefaultStyle,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
  getSpaceBreakCount,
  checkHeight,
  setDocStyle,
} = require("../../helpers/styles");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf style helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should import the real jspdfFonts module with chooseFontForText", () => {
    expect(actualJspdfFonts).toBeDefined();
    expect(typeof actualJspdfFonts.chooseFontForText).toBe("function");
  });

  it("chooseFontForText should route symbol-heavy text to NotoSerif", () => {
    expect(actualJspdfFonts.chooseFontForText("Decimal: A ☃", "helvetica")).toBe("NotoSerif");
    expect(actualJspdfFonts.chooseFontForText("Text and emoji variation selector pairs: ✈︎ ✈️ ♥︎ ❤️", "helvetica")).toBe("NotoSerif");
  });

  it("chooseFontForText should route combining-mark text to NotoSerif", () => {
    expect(actualJspdfFonts.chooseFontForText("Simple combining marks: á ê ï ō ů ñ", "helvetica")).toBe("NotoSerif");
    expect(actualJspdfFonts.chooseFontForText("Repeated combining marks: Z̴̷̸͓͔͕a̵̶̷͙͚l̴̵͍g̵͔o̶͍", "helvetica")).toBe("NotoSerif");
  });

  it("should return default style", () => {
    const style = getDefaultStyle();

    expect(style.fontSize).toBe(10);
    expect(style.textColor).toBe("#333333");
    expect(style.italics).toBe(false);
    expect(style.linkColor).toBe("#0000EE");
  });

  it("should merge default style overrides", () => {
    const style = ({ ...getDefaultStyle(), ...{ fontSize: 18, textColor: "#111" } });

    expect(style.fontSize).toBe(18);
    expect(style.textColor).toBe("#111");
  });

  it("should push and pop style stack", () => {
    const context = {
      style: ({ ...getDefaultStyle(), ...{ bold: false } }),
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
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 150, currentWidth: 77, cursorIndex: 80 } }),
      styleStack: [({ ...getDefaultStyle(), ...{ currentHeight: 70, currentWidth: 60, cursorIndex: 60, bold: true } })],
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
    const style = ({ ...getDefaultStyle(), ...{ currentHeight: 780, lineSpc: 20, pageHeight: 790, startHeight: 70 } });

    const result = checkHeight(doc, style);

    expect(doc.addPage).toHaveBeenCalled();
    expect(result).toBe(70);
  });

  it("setDocStyle should configure font, size, and text style", () => {
    const doc = createMockDoc();
    const style = ({ ...getDefaultStyle(), ...{ fontSize: 12, bold: true, italics: true, font: "Times" } });

    setDocStyle(doc, "hello", style);

    expect(jspdfFonts.chooseFontForText).toHaveBeenCalledWith("hello", "Times");
    expect(doc.setFontSize).toHaveBeenCalledWith(12);
    expect(doc.setTextColor).toHaveBeenCalledWith(style.textColor);
    expect(doc.setDrawColor).toHaveBeenCalledWith(style.drawColor);
    expect(doc.setFont).toHaveBeenCalledWith("mock-font", "bolditalic");
  });

  it("setDocStyle should use jspdfFonts chooser when no explicit font is set", () => {
    const doc = createMockDoc();
    const style = ({ ...getDefaultStyle(), ...{ font: null, code: false } });

    setDocStyle(doc, "hello", style);

    expect(jspdfFonts.chooseFontForText).toHaveBeenCalledWith("hello", null);
    expect(doc.setFont).toHaveBeenCalledWith("mock-font", "normal");
  });

  it("setDocStyle should reset text style to normal when not bold or italic", () => {
    const doc = createMockDoc();

    setDocStyle(doc, "first", ({ ...getDefaultStyle(), ...{ bold: true } }));
    setDocStyle(doc, "second", ({ ...getDefaultStyle(), ...{ bold: false, italics: false } }));

    expect(doc.setFont).toHaveBeenCalledWith("mock-font", "bold");
    expect(doc.setFont).toHaveBeenCalledWith("mock-font", "normal");
  });

  it("getSpaceBreakCount should return 1 for non-space tokens", () => {
    expect(getSpaceBreakCount.call({}, { type: "text", raw: "\n\n\n" })).toBe(1);
  });

  it("getSpaceBreakCount should convert raw newline count into blank-line count", () => {
    expect(getSpaceBreakCount.call({}, { type: "space", raw: "\n\n" })).toBe(1);
    expect(getSpaceBreakCount.call({}, { type: "space", raw: "\n\n\n" })).toBe(2);
  });

  it("getSpaceBreakCount should default to 1 when raw is missing", () => {
    expect(getSpaceBreakCount.call({}, { type: "space" })).toBe(1);
  });
});
