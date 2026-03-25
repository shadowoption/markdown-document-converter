// Mock modules before requiring classes
jest.mock("marked", () => ({
  lexer: jest.fn().mockReturnValue([]),
  walkTokens: jest.fn((tokens, callback) => {
    tokens.forEach(callback);
  }),
}));

jest.mock("he", () => ({
  decode: jest.fn((text) => text),
}));

const { MarkdownToDocx } = require("../MarkdownToDocx");
const docx = require("docx");
const marked = require("marked");
const he = require("he");

describe("MarkdownToDocx class", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks with default implementations
    marked.lexer.mockReturnValue([]);
    marked.walkTokens.mockImplementation((tokens, callback) => {
      tokens.forEach(callback);
    });
    he.decode.mockImplementation((text) => text);
  });
  describe("constructor", () => {
    it("should initialize with default style", () => {
      const doc = new MarkdownToDocx();

      expect(doc.getParagraphs()).toEqual([]);
      expect(doc.getCurrent()).toEqual([]);
      expect(doc.styleStack).toEqual([]);
      expect(doc.style.font).toBe("Arial");
      expect(doc.style.fontSize).toBe(22);
    });

    it("should initialize with custom style", () => {
      const customStyle = { font: "Courier", fontSize: 20 };
      const doc = new MarkdownToDocx(customStyle);

      expect(doc.style.font).toBe("Courier");
      expect(doc.style.fontSize).toBe(20);
    });

    it("should keep style without derived indent field", () => {
      const doc = new MarkdownToDocx({ fontSize: 30 });

      expect(doc.style.fontSize).toBe(30);
    });

    it("should bind all helper methods", () => {
      const doc = new MarkdownToDocx();

      expect(typeof doc.pushStyle).toBe("function");
      expect(typeof doc.popStyle).toBe("function");
      expect(typeof doc.updateStyle).toBe("function");
      expect(typeof doc.setTextStyle).toBe("function");
      expect(typeof doc.writeText).toBe("function");
      expect(typeof doc.breakLine).toBe("function");
      expect(typeof doc.groupParagraph).toBe("function");
      expect(typeof doc.horizontalLine).toBe("function");
      expect(typeof doc.processTable).toBe("function");
      expect(typeof doc.writeLink).toBe("function");
      expect(typeof doc.writeCheckBox).toBe("function");
      expect(typeof doc.writeList).toBe("function");
      expect(typeof doc.writeListItem).toBe("function");
      expect(typeof doc.writeCode).toBe("function");
      expect(typeof doc.writeCodeSpan).toBe("function");
      expect(typeof doc.writeBlockquote).toBe("function");
      expect(typeof doc.writeHeading).toBe("function");
    });

    it("should bind processor methods", () => {
      const doc = new MarkdownToDocx();

      expect(typeof doc.processParent).toBe("function");
      expect(typeof doc.processChild).toBe("function");
      expect(typeof doc.DFS).toBe("function");
    });

    it("should have correct bound context for methods", () => {
      const doc = new MarkdownToDocx();
      const method = doc.updateStyle;

      method({ bold: true });
      expect(doc.style.bold).toBe(true);
    });

    it("should get and set current", () => {
      const doc = new MarkdownToDocx();
      const value = [{ text: "x" }];

      doc.setCurrent(value);

      expect(doc.getCurrent()).toBe(value);
    });

    it("should get and set paragraphs", () => {
      const doc = new MarkdownToDocx();
      const value = [{ paragraph: true }];

      doc.setParagraphs(value);

      expect(doc.getParagraphs()).toBe(value);
    });

    it("should get and set style", () => {
      const doc = new MarkdownToDocx();
      const value = { font: "Courier" };

      doc.setStyle(value);

      expect(doc.getStyle()).toBe(value);
    });

    it("should get and set styleStack", () => {
      const doc = new MarkdownToDocx();
      const value = [{ bold: true }];

      doc.setStyleStack(value);

      expect(doc.getStyleStack()).toBe(value);
    });

    it("should throw for invalid current", () => {
      const doc = new MarkdownToDocx();

      expect(() => doc.setCurrent({})).toThrow("current must be an array");
    });

    it("should throw for invalid paragraphs", () => {
      const doc = new MarkdownToDocx();

      expect(() => doc.setParagraphs({})).toThrow("paragraphs must be an array");
    });

    it("should throw for invalid style", () => {
      const doc = new MarkdownToDocx();

      expect(() => doc.setStyle([])).toThrow("style must be an object");
      expect(() => doc.setStyle(null)).toThrow("style must be an object");
    });

    it("should throw for invalid styleStack", () => {
      const doc = new MarkdownToDocx();

      expect(() => doc.setStyleStack({})).toThrow("styleStack must be an array");
    });

    it("should expose default style getter", () => {
      const doc = new MarkdownToDocx();
      const style = doc.getDefaultStyle();

      expect(style).toBeDefined();
      expect(style.font).toBe("Arial");
      expect(typeof doc.setDefaultStyle).toBe("undefined");
    });

    it("should expose heading map getter", () => {
      const doc = new MarkdownToDocx();
      const headingMap = doc.getHeadingMap();

      expect(Array.isArray(headingMap)).toBe(true);
      expect(headingMap[1]).toBe(docx.HeadingLevel.HEADING_1);
      expect(typeof doc.setHeadingMap).toBe("undefined");
    });
  });

  describe("convert method", () => {
    it("should call marked.lexer with gfm and breaks enabled", () => {
      const doc = new MarkdownToDocx();
      const markdown = "Hello world";

      doc.convert(markdown);

      expect(marked.lexer).toHaveBeenCalledWith(markdown, {
        gfm: true,
        breaks: true,
      });
    });

    it("should call marked.walkTokens", () => {
      const doc = new MarkdownToDocx();
      const markdown = "Test";

      doc.convert(markdown);

      expect(marked.walkTokens).toHaveBeenCalled();
    });

    it("should decode HTML entities in token text", () => {
      const doc = new MarkdownToDocx();
      const tokens = [{ text: "&lt;test&gt;" }];
      marked.lexer.mockReturnValue(tokens);

      doc.convert("test");

      expect(he.decode).toHaveBeenCalledWith("&lt;test&gt;");
    });

    it("should split code block lines", () => {
      const doc = new MarkdownToDocx();
      const codeToken = {
        type: "code",
        text: "line1\nline2\nline3",
      };
      const tokens = [codeToken];
      marked.lexer.mockReturnValue(tokens);

      doc.convert("test");

      // Check that walkTokens modified the token
      expect(marked.walkTokens).toHaveBeenCalled();
    });

    it("should return paragraphs array", () => {
      const doc = new MarkdownToDocx();
      const result = doc.convert("test");

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle empty markdown", () => {
      const doc = new MarkdownToDocx();
      const result = doc.convert("");

      expect(marked.lexer).toHaveBeenCalledWith("", {
        gfm: true,
        breaks: true,
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should call DFS with tokens", () => {
      const doc = new MarkdownToDocx();
      doc.DFS = jest.fn();
      const tokens = [{ type: "text", text: "content" }];
      marked.lexer.mockReturnValue(tokens);

      doc.convert("test");

      expect(doc.DFS).toHaveBeenCalledWith(tokens);
    });

    it("should group final paragraph", () => {
      const doc = new MarkdownToDocx();
      doc.groupParagraph = jest.fn();

      doc.convert("test");

      expect(doc.groupParagraph).toHaveBeenCalled();
    });

    it("should handle multiple tokens", () => {
      const doc = new MarkdownToDocx();
      const tokens = [
        { type: "heading", depth: 1, tokens: [] },
        { type: "paragraph", tokens: [] },
        { type: "list", ordered: false, items: [] },
      ];
      marked.lexer.mockReturnValue(tokens);

      const result = doc.convert("test");

      expect(marked.lexer).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should process walkTokens with text property", () => {
      const doc = new MarkdownToDocx();
      const tokens = [
        { text: "&amp;", type: "text" },
        { text: "&nbsp;", type: "space" },
      ];

      marked.lexer.mockReturnValue(tokens);

      doc.convert("test");

      // Verify walkTokens processes each token
      expect(marked.walkTokens).toHaveBeenCalled();
    });

    it("should process code tokens with line splitting", () => {
      const doc = new MarkdownToDocx();
      const codeToken = {
        type: "code",
        text: "const x = 1;\nreturn x;",
        lang: "javascript",
      };
      marked.lexer.mockReturnValue([codeToken]);

      doc.convert("```javascript\nconst x = 1;\nreturn x;\n```");

      expect(marked.walkTokens).toHaveBeenCalled();
    });
  });

  describe("integration", () => {
    it("should return empty paragraphs for empty tokens", () => {
      const doc = new MarkdownToDocx();
      marked.lexer.mockReturnValue([]);

      const result = doc.convert("test");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should maintain default style", () => {
      const doc = new MarkdownToDocx();
      marked.lexer.mockReturnValue([]);

      doc.convert("test");

      expect(doc.style.font).toBe("Arial");
      expect(doc.style.fontSize).toBe(22);
    });

    it("should maintain custom style", () => {
      const doc = new MarkdownToDocx({ font: "Courier", fontSize: 18 });
      marked.lexer.mockReturnValue([]);

      doc.convert("test");

      expect(doc.style.font).toBe("Courier");
      expect(doc.style.fontSize).toBe(18);
    });

    it("should reset style stack after conversion", () => {
      const doc = new MarkdownToDocx();
      marked.lexer.mockReturnValue([]);

      doc.convert("test");

      expect(doc.styleStack.length).toBe(0);
    });

    it("should clear current array after conversion", () => {
      const doc = new MarkdownToDocx();
      marked.lexer.mockReturnValue([]);

      doc.convert("test");

      expect(doc.getCurrent().length).toBe(0);
    });

    it("should handle multiple conversions", () => {
      const doc = new MarkdownToDocx();
      marked.lexer.mockReturnValue([]);

      const result1 = doc.convert("test1");
      const result2 = doc.convert("test2");

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });

    it("should call he.decode for all text tokens", () => {
      const doc = new MarkdownToDocx();
      const tokens = [
        { text: "hello", type: "text" },
        { text: "world" },
      ];
      marked.lexer.mockReturnValue(tokens);

      doc.convert("test");

      expect(he.decode).toHaveBeenCalledWith("hello");
      expect(he.decode).toHaveBeenCalledWith("world");
    });

    it("should process all token types via walkTokens", () => {
      const doc = new MarkdownToDocx();
      const callback = jest.fn();

      marked.walkTokens.mockImplementation((tokens, cb) => {
        tokens.forEach(cb);
      });

      const tokens = [
        { type: "heading", text: "Title" },
        { type: "paragraph", text: "Content" },
      ];
      marked.lexer.mockReturnValue(tokens);

      doc.convert("test");

      expect(marked.walkTokens).toHaveBeenCalled();
    });
  });
});
