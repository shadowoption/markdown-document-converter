const { writeHeading } = require("../../helpers/heading");
const docx = require("docx");

describe("heading.js helpers", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      style: {
        headingLevel: null,
        bold: false,
      },
      groupParagraph: jest.fn(),
      updateStyle: jest.fn(function(partial) {
        this.style = { ...this.style, ...partial };
      }),
      DFS: jest.fn(),
      breakLine: jest.fn(),
    };
  });

  describe("writeHeading", () => {
    it("should group paragraph before processing heading", () => {
      const token = { depth: 1, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalled();
    });

    it("should set heading level for depth 1 (H1)", () => {
      const token = { depth: 1, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: docx.HeadingLevel.HEADING_1,
        bold: true,
      });
    });

    it("should set heading level for depth 2 (H2)", () => {
      const token = { depth: 2, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: docx.HeadingLevel.HEADING_2,
        bold: true,
      });
    });

    it("should set heading level for depth 3 (H3)", () => {
      const token = { depth: 3, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: docx.HeadingLevel.HEADING_3,
        bold: true,
      });
    });

    it("should set heading level for depth 4 (H4)", () => {
      const token = { depth: 4, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: docx.HeadingLevel.HEADING_4,
        bold: true,
      });
    });

    it("should set heading level for depth 5 (H5)", () => {
      const token = { depth: 5, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: docx.HeadingLevel.HEADING_5,
        bold: true,
      });
    });

    it("should set heading level for depth 6 (H6)", () => {
      const token = { depth: 6, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: docx.HeadingLevel.HEADING_6,
        bold: true,
      });
    });

    it("should always set bold to true", () => {
      const token = { depth: 1, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith(
        expect.objectContaining({ bold: true })
      );
    });

    it("should process heading tokens using DFS", () => {
      const tokens = [{ type: "text", text: "Heading Text" }];
      const token = { depth: 1, tokens };
      writeHeading.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(tokens);
    });

    it("should handle empty tokens array", () => {
      const token = { depth: 2, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should group paragraph after processing heading", () => {
      const token = { depth: 1, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalledTimes(2);
    });

    it("should break line after heading", () => {
      const token = { depth: 1, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.breakLine).toHaveBeenCalled();
    });

    it("should set heading level to null for invalid depth", () => {
      const token = { depth: 7, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: null,
        bold: true,
      });
    });

    it("should set heading level to null for depth 0", () => {
      const token = { depth: 0, tokens: [] };
      writeHeading.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        headingLevel: null,
        bold: true,
      });
    });

    it("should process nested heading tokens", () => {
      const nestedTokens = [
        { type: "text", text: "Title " },
        { type: "strong", tokens: [{ type: "text", text: "Bold" }] },
      ];
      const token = { depth: 3, tokens: nestedTokens };
      writeHeading.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
    });
  });
});
