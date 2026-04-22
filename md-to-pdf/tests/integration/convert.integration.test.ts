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
const marked = require("marked");

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

  it("should draw code block borders as per-page segments when content spans pages", () => {
    marked.lexer.mockImplementationOnce(() => [
      {
        type: "code",
        text: "l1\nl2\nl3\nl4\nl5",
      },
    ]);

    let currentPage = 1;
    const doc = createMockDoc({
      addPage: jest.fn(() => {
        currentPage += 1;
      }),
      getCurrentPageInfo: jest.fn(() => ({ pageNumber: currentPage })),
      setPage: jest.fn((page) => {
        currentPage = page;
      }),
    });

    const api = createMdToPdf();
    api.convert(doc, "```\ncode\n```", {
      currentHeight: 70,
      startHeight: 70,
      pageHeight: 120,
      lineDistance: 10,
      lineSpc: 18,
      currentWidth: 60,
      startWidth: 60,
      maxLineWidth: 500,
    });

    expect(doc.rect).toHaveBeenCalledTimes(2);
    expect(doc.rect).toHaveBeenNthCalledWith(1, 60, 70, 440, 50);
    expect(doc.rect).toHaveBeenNthCalledWith(2, 60, 52, 440, 48);
    expect(doc.rect.mock.calls[1][1]).toBeLessThan(70);
    expect(doc.rect.mock.calls[1][3]).toBeLessThan(50);
  });

  it("should place paragraph text on a new line after block html following a list", () => {
    marked.lexer.mockImplementationOnce(() => [
      {
        type: "list",
        ordered: false,
        loose: false,
        items: [
          {
            type: "list_item",
            loose: false,
            task: false,
            tokens: [
              {
                type: "text",
                tokens: [{ type: "text", text: "Item" }],
              },
            ],
          },
        ],
      },
      { type: "space" },
      { type: "html", block: true, raw: "<div> This is a div </div>\n\n" },
      { type: "paragraph", tokens: [{ type: "text", text: "This is text" }] },
    ]);

    const api = createMdToPdf();
    const doc = createMockDoc();

    api.convert(doc, "fixture", {
      currentHeight: 70,
      currentWidth: 60,
      lineDistance: 10,
      lineSpc: 18,
    });

    const htmlCall = doc.text.mock.calls.find((call) => String(call[0]).includes("</div>"));
    const paragraphCall = doc.text.mock.calls.find((call) => String(call[0]) === "This is text");

    expect(htmlCall).toBeDefined();
    expect(paragraphCall).toBeDefined();
    expect(paragraphCall[2] - htmlCall[2]).toBe(20);
  });

  it("should not insert an extra blank line before nested list items", () => {
    marked.lexer.mockImplementationOnce(() => [
      {
        type: "list",
        ordered: false,
        loose: false,
        items: [
          {
            type: "list_item",
            loose: false,
            task: false,
            tokens: [
              { type: "text", text: "Parent" },
              {
                type: "list",
                ordered: false,
                loose: false,
                items: [
                  {
                    type: "list_item",
                    loose: false,
                    task: false,
                    tokens: [{ type: "text", text: "Child" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const api = createMdToPdf();
    const doc = createMockDoc();

    api.convert(doc, "fixture", {
      currentHeight: 70,
      currentWidth: 60,
      lineDistance: 10,
      lineSpc: 18,
    });

    const parentCall = doc.text.mock.calls.find((call) => String(call[0]) === "Parent");
    const childCall = doc.text.mock.calls.find((call) => String(call[0]) === "Child");

    expect(parentCall).toBeDefined();
    expect(childCall).toBeDefined();
    expect(childCall[2] - parentCall[2]).toBe(10);
  });
});
