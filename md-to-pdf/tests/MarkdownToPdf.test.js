jest.mock("marked", () => ({
  lexer: jest.fn().mockReturnValue([]),
  walkTokens: jest.fn((tokens, callback) => tokens.forEach(callback)),
}));

jest.mock("he", () => ({
  decode: jest.fn((text) => text),
}));

const marked = require("marked");
const he = require("he");
const { MarkdownToPdf } = require("../MarkdownToPdf");
const { createMockDoc } = require("./test-utils/mockDoc");

describe("MarkdownToPdf class", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    marked.lexer.mockReturnValue([]);
    marked.walkTokens.mockImplementation((tokens, callback) => tokens.forEach(callback));
    he.decode.mockImplementation((text) => text);
  });

  it("should initialize with defaults", () => {
    const pdf = new MarkdownToPdf();

    expect(pdf.getStyle()).toBeDefined();
    expect(pdf.getStyle().fontSize).toBe(10);
    expect(pdf.getStyleStack()).toEqual([]);
  });

  it("should initialize with custom style", () => {
    const pdf = new MarkdownToPdf({ fontSize: 16, textColor: "#111111" });

    expect(pdf.getStyle().fontSize).toBe(16);
    expect(pdf.getStyle().textColor).toBe("#111111");
    expect(pdf.getStyle().drawColor).toBe("#111111");
  });

  it("should bind helper and processor methods", () => {
    const pdf = new MarkdownToPdf();

    expect(typeof pdf.pushStyle).toBe("function");
    expect(typeof pdf.popStyle).toBe("function");
    expect(typeof pdf.updateStyle).toBe("function");
    expect(typeof pdf.setTextStyle).toBe("function");
    expect(typeof pdf.writeText).toBe("function");
    expect(typeof pdf.lineBreak).toBe("function");
    expect(typeof pdf.horizontalLine).toBe("function");
    expect(typeof pdf.processParent).toBe("function");
    expect(typeof pdf.processChild).toBe("function");
    expect(typeof pdf.DFS).toBe("function");
  });

  it("should call marked lexer with gfm and breaks", () => {
    const pdf = new MarkdownToPdf();
    const doc = createMockDoc();

    pdf.convert(doc, "hello");

    expect(marked.lexer).toHaveBeenCalledWith("hello", { gfm: true, breaks: true });
  });

  it("should decode token text and split code lines", () => {
    const tokens = [
      { type: "text", text: "&lt;value&gt;" },
      { type: "code", text: "a\nb" },
    ];
    marked.lexer.mockReturnValue(tokens);

    const pdf = new MarkdownToPdf();
    const doc = createMockDoc();

    pdf.convert(doc, "markdown");

    expect(he.decode).toHaveBeenCalledWith("&lt;value&gt;");
    expect(tokens[1].lines).toEqual(["a", "b"]);
  });

  it("should invoke DFS and return currentHeight", () => {
    const pdf = new MarkdownToPdf();
    const doc = createMockDoc();
    const dfsSpy = jest.spyOn(pdf, "DFS").mockImplementation(() => {
      pdf.updateStyle({ currentHeight: 234 });
    });

    const result = pdf.convert(doc, "test");

    expect(dfsSpy).toHaveBeenCalled();
    expect(result).toBe(234);
  });
});
