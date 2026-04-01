const { writeBlockquote } = require("../../helpers/blockquote");
const docx = require("docx");

describe("blockquote.js helpers", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      style: {
        quote: false,
        indentLevel: 0,
        blockColor: "858585",
        textColor: "333333",
      },
      groupParagraph: jest.fn(),
      updateStyle: jest.fn(function(partial) {
        this.style = { ...this.style, ...partial };
      }),
      DFS: jest.fn(),
    };
  });

  describe("writeBlockquote", () => {
    it("should group paragraph before processing blockquote", () => {
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalled();
    });

    it("should set quote style to true", () => {
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          quote: true,
        })
      );
    });

    it("should increment indent level", () => {
      mockContext.style.indentLevel = 1;
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          indentLevel: 2,
        })
      );
    });

    it("should change text color to block color", () => {
      mockContext.style.blockColor = "FF0000";
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          textColor: "FF0000",
        })
      );
    });

    it("should update all blockquote styles at once", () => {
      mockContext.style.indentLevel = 0;
      mockContext.style.blockColor = "999999";
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        quote: true,
        indentLevel: 1,
        textColor: "999999",
      });
    });

    it("should process blockquote tokens with DFS", () => {
      const tokens = [
        { type: "text", text: "quoted text" },
        { type: "paragraph", tokens: [] },
      ];
      const token = { tokens };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(tokens);
    });

    it("should handle empty tokens array", () => {
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should handle missing tokens with fallback empty array", () => {
      const token = {};
      writeBlockquote.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should group paragraph after processing", () => {
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalledTimes(2);
    });

    it("should handle nested blockquotes", () => {
      const nestedTokens = [
        { type: "blockquote", tokens: [{ type: "text", text: "nested" }] },
      ];
      const token = { tokens: nestedTokens };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
    });

    it("should preserve other style properties", () => {
      mockContext.style.bold = true;
      mockContext.style.fontSize = 28;
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.style.bold).toBe(true);
      expect(mockContext.style.fontSize).toBe(28);
    });

    it("should handle multiple blockquotes with different indent levels", () => {
      mockContext.style.indentLevel = 0;
      const token1 = { tokens: [] };
      writeBlockquote.call(mockContext, token1);

      expect(mockContext.style.indentLevel).toBe(1);

      mockContext.style.indentLevel = 1;
      const token2 = { tokens: [] };
      writeBlockquote.call(mockContext, token2);

      expect(mockContext.style.indentLevel).toBe(2);
    });

    it("should handle blockquote with paragraph content", () => {
      const paragraphTokens = [
        { type: "text", text: "This is a " },
        { type: "strong", tokens: [{ type: "text", text: "quoted" }] },
        { type: "text", text: " paragraph" },
      ];
      const token = { tokens: paragraphTokens };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(paragraphTokens);
    });

    it("should handle blockquote with list content", () => {
      const listTokens = [
        { type: "list", items: [{ type: "text", text: "item 1" }] },
      ];
      const token = { tokens: listTokens };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(listTokens);
    });

    it("should correctly set text color from blockColor when different", () => {
      mockContext.style.textColor = "333333";
      mockContext.style.blockColor = "CCCCCC";
      const token = { tokens: [] };
      writeBlockquote.call(mockContext, token);

      expect(mockContext.style.textColor).toBe("CCCCCC");
    });

    it("should handle various indent levels", () => {
      const levels = [0, 1, 2, 5, 10];

      levels.forEach((level) => {
        mockContext.style.indentLevel = level;
        mockContext.updateStyle.mockClear();

        const token = { tokens: [] };
        writeBlockquote.call(mockContext, token);

        expect(mockContext.updateStyle).toHaveBeenCalledWith(
          expect.objectContaining({
            indentLevel: level + 1,
          })
        );
      });
    });
  });
});
