jest.mock("marked", () => ({
  lexer: jest.fn().mockReturnValue([]),
  walkTokens: jest.fn((tokens, callback) => tokens.forEach(callback)),
}));

jest.mock("he", () => ({
  decode: jest.fn((text) => text),
}));

const createMdToPdf = require("../index");
const { MarkdownToPdf } = require("../MarkdownToPdf");
const { createMockDoc } = require("./test-utils/mockDoc");

describe("md-to-pdf index", () => {
  it("should expose convert API", () => {
    const api = createMdToPdf();

    expect(typeof api.convert).toBe("function");
  });

  it("should delegate convert to MarkdownToPdf class", () => {
    const convertSpy = jest.spyOn(MarkdownToPdf.prototype, "convert").mockReturnValue(123);
    const api = createMdToPdf();
    const doc = createMockDoc();

    const result = api.convert(doc, "hello", { fontSize: 12 });

    expect(result).toBe(123);
    expect(convertSpy).toHaveBeenCalledWith(doc, "hello");

    convertSpy.mockRestore();
  });
});
