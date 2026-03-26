jest.mock("marked", () => ({
  lexer: jest.fn(() => [
    { type: "paragraph", tokens: [{ type: "text", text: "Hello" }] },
    { type: "space" },
    { type: "paragraph", tokens: [{ type: "text", text: "World" }] },
    {
      type: "list",
      ordered: true,
      start: 1,
      items: [{ type: "list_item", loose: false, task: false, tokens: [{ type: "text", text: "Item" }] }],
    },
  ]),
  walkTokens: jest.fn((tokens, callback) => {
    const visit = (token) => {
      callback(token);
      if (Array.isArray(token.items)) token.items.forEach(visit);
      if (Array.isArray(token.tokens)) token.tokens.forEach(visit);
    };
    tokens.forEach(visit);
  }),
}));

jest.mock("he", () => ({
  decode: jest.fn((text) => text),
}));

const createMdToPdf = require("../../index");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("integration: markdown to pdf", () => {
  it("should render markdown tokens and increase currentHeight for line breaks", () => {
    const api = createMdToPdf();
    const doc = createMockDoc();

    const currentHeight = api.convert(doc, "# test", {
      currentHeight: 70,
      currentWidth: 60,
      lineDistance: 10,
      lineSpc: 18,
    });

    expect(currentHeight).toBeGreaterThan(70);
    expect(doc.text).toHaveBeenCalled();
  });

  it("should keep numbered prefix on same line and render via text calls", () => {
    const api = createMdToPdf();
    const doc = createMockDoc();

    api.convert(doc, "1. Item", {
      currentHeight: 70,
      currentWidth: 60,
    });

    const renderedTexts = doc.text.mock.calls.map((call) => String(call[0]));
    expect(renderedTexts.some((text) => text.includes("1."))).toBe(true);
    expect(renderedTexts.some((text) => text.includes("Item"))).toBe(true);
  });
});
