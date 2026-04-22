const { chooseSplitWidth, writeText, writePrefix } = require("../../helpers/text");
const { getDefaultStyle, setDocStyle } = require("../../helpers/styles");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf text helpers", () => {
  describe("chooseSplitWidth", () => {
    function createDoc(getTextWidth = (value) => String(value).length * 5) {
      return {
        getTextWidth: jest.fn(getTextWidth),
      };
    }

    it("returns remaining width for empty text", () => {
      expect(chooseSplitWidth("", 80, 400, createDoc())).toBe(80);
    });

    it("returns remaining width for whitespace-only text", () => {
      expect(chooseSplitWidth("   \t  ", 75, 400, createDoc())).toBe(75);
    });

    it("returns full-line width when first word does not fit remaining width", () => {
      expect(chooseSplitWidth("Reference Link", 15, 440, createDoc())).toBe(440);
    });

    it("keeps remaining width for one-word text that already fits", () => {
      expect(chooseSplitWidth("hello", 80, 400, createDoc())).toBe(80);
    });

    it("keeps remaining width for single long word that cannot fit even full line", () => {
      expect(
        chooseSplitWidth("supercalifragilisticexpialidocious", 30, 440, createDoc(() => 1000))
      ).toBe(30);
    });

    it("falls back to full-line width when remaining width is zero or negative", () => {
      expect(chooseSplitWidth("Reference", 0, 440, createDoc())).toBe(440);
      expect(chooseSplitWidth("Reference", -10, 440, createDoc())).toBe(440);
    });

    it("never returns less than 1", () => {
      expect(chooseSplitWidth("", -10, 0, createDoc())).toBe(1);
    });
  });

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

  it("should render split pieces on separate lines", () => {
    const { context, doc } = createContext(
      {
        splitTextToSize: jest.fn(() => ["naturally in exported", "documents"]),
        getTextWidth: jest.fn((text) => String(text).length * 5),
      },
      {
        currentWidth: 10,
        cursorIndex: 10,
        maxLineWidth: 500,
        currentHeight: 100,
        lineDistance: 10,
      }
    );

    writeText.call(context, "naturally in exported documents");

    expect(doc.text).toHaveBeenCalledTimes(2);
    expect(doc.text.mock.calls[0][0]).toBe("naturally in exported");
    expect(doc.text.mock.calls[1][0]).toBe("documents");
    expect(doc.text.mock.calls[1][2] - doc.text.mock.calls[0][2]).toBe(10);
  });

  it("should move to next line before splitting when first word cannot fit remaining width", () => {
    const { context, doc } = createContext(
      {
        splitTextToSize: jest.fn((text, width) => {
          if (text === "Reference Link" && width === 15) return ["Ref", "ere", "nc", "e", "L", "ink"];
          if (text === "Reference Link" && width === 440) return ["Reference Link"];
          return [text];
        }),
        getTextWidth: jest.fn((text) => String(text).length * 5),
      },
      {
        currentWidth: 60,
        cursorIndex: 485,
        maxLineWidth: 500,
        currentHeight: 100,
        lineDistance: 10,
      }
    );

    writeText.call(context, "Reference Link");

    expect(doc.splitTextToSize).toHaveBeenCalledWith("Reference Link", 440);
    expect(doc.text).toHaveBeenCalledTimes(1);
    expect(doc.text).toHaveBeenCalledWith("Reference Link", 60, 110);
    expect(context.style.currentHeight).toBe(110);
    expect(context.style.cursorIndex).toBe(130);
  });

  it("should split continuation lines using full width after a mid-line wrap", () => {
    const text = "and enough words to wrap visually across lines in narrow pages";
    const { context, doc } = createContext(
      {
        splitTextToSize: jest.fn((value, width) => {
          if (value === text && width === 220) {
            return ["and enough words to", "wrap visually across", "lines in narrow pages"];
          }
          if (value === "lines in narrow pages" && width === 440) {
            return ["lines in narrow pages"];
          }
          return [value];
        }),
        getTextWidth: jest.fn((value) => String(value).length * 5),
      },
      {
        currentWidth: 60,
        cursorIndex: 280,
        maxLineWidth: 500,
        currentHeight: 100,
        lineDistance: 10,
      }
    );

    writeText.call(context, text);

    expect(doc.splitTextToSize).toHaveBeenCalledWith(text, 220);
    expect(doc.splitTextToSize).toHaveBeenCalledWith("lines in narrow pages", 440);
    expect(doc.text).toHaveBeenCalledTimes(2);
    expect(doc.text.mock.calls[0][0]).toBe("and enough words to wrap visually across ");
    expect(doc.text.mock.calls[1][0]).toBe("lines in narrow pages");
  });

  it("should advance line when wrapped output has a trailing empty piece", () => {
    const { context } = createContext(
      {
        splitTextToSize: jest.fn(() => ["3.", ""]),
        getTextWidth: jest.fn((text) => (text === "3." ? 10 : 0)),
      },
      {
        currentWidth: 60,
        cursorIndex: 60,
        maxLineWidth: 500,
        currentHeight: 100,
        lineDistance: 10,
      }
    );

    const before = context.style.currentHeight;

    writeText.call(context, "3. ");

    expect(context.style.currentHeight).toBe(before + 10);
  });

  it("writePrefix should prepend token prefix", () => {
    const { context } = createContext();
    const spy = jest.spyOn(context, "writeText");

    writePrefix.call(context, { prefix: "1. " });

    expect(spy).toHaveBeenCalledWith("1. ");
  });
});
