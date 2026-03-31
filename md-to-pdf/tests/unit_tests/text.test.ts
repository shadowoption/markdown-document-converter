const { writeText, writePrefix } = require("../../helpers/text");
const { getDefaultStyle, setDocStyle } = require("../../helpers/styles");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf text helpers", () => {
  function createContext(docOverrides = {}, styleOverrides = {}) {
    const doc = createMockDoc(docOverrides);
    const context = {
      style: ({ ...getDefaultStyle(), ...styleOverrides }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      setDocStyle,
      writeText(text) {
        return writeText.call(this, text);
      },
    };

    return { context, doc };
  }

  it("should write plain text and advance cursor", () => {
    const { context, doc } = createContext();

    writeText.call(context, "hello");

    expect(doc.text).toHaveBeenCalled();
    expect(context.style.cursorIndex).toBeGreaterThan(context.style.currentWidth);
  });

  it("should write link text via textWithLink", () => {
    const { context, doc } = createContext({}, { link: "https://example.com" });

    writeText.call(context, "click");

    expect(doc.textWithLink).toHaveBeenCalled();
    expect(doc.text).not.toHaveBeenCalled();
  });

  it("should draw strike line when strike is enabled", () => {
    const { context, doc } = createContext({}, { strike: true });

    writeText.call(context, "strike me");

    expect(doc.line).toHaveBeenCalled();
  });

  it("should increase currentHeight on wrapped text/new line", () => {
    const { context } = createContext(
      {
        splitTextToSize: jest.fn(() => ["first", "second"]),
        getTextWidth: jest.fn((text) => (text === "first" ? 60 : 40)),
      },
      {
        currentWidth: 10,
        cursorIndex: 10,
        maxLineWidth: 50,
        currentHeight: 100,
        lineSpc: 12,
      }
    );

    const before = context.style.currentHeight;
    writeText.call(context, "wrapped");

    expect(context.style.currentHeight).toBeGreaterThan(before);
  });

  it("writePrefix should prepend token prefix", () => {
    const { context } = createContext();
    const spy = jest.spyOn(context, "writeText");

    writePrefix.call(context, { prefix: "1. " });

    expect(spy).toHaveBeenCalledWith("1. ");
  });
});
