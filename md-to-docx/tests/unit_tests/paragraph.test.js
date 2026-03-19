const { groupParagraph } = require("../../helpers/paragraph");
const docx = require("docx");

describe("paragraph.js helpers", () => {
  let mockContext;
  let paragraphSpy;

  beforeEach(() => {
    mockContext = {
      current: [],
      paragraphs: [],
      style: {
        headingLevel: null,
        quote: false,
        code: false,
        indentLevel: 0,
        indentSize: 220,
        blockColor: "858585",
        fontSize: 22,
      },
    };

    // Mock Paragraph constructor to capture options
    paragraphSpy = jest.spyOn(docx, "Paragraph").mockImplementation(function(options) {
      this.options = options;
      this.children = options?.children;
      this.heading = options?.heading;
      this.border = options?.border;
      this.indent = options?.indent;
    });
  });

  afterEach(() => {
    paragraphSpy.mockRestore();
  });

  describe("groupParagraph", () => {
    it("should not add paragraph if current is empty", () => {
      groupParagraph.call(mockContext);

      expect(mockContext.paragraphs.length).toBe(0);
    });

    it("should add paragraph to paragraphs array", () => {
      mockContext.current = [new docx.TextRun({ text: "text" })];
      groupParagraph.call(mockContext);

      expect(mockContext.paragraphs.length).toBe(1);
      expect(mockContext.paragraphs[0] instanceof docx.Paragraph).toBe(true);
    });

    it("should create paragraph with current children", () => {
      const textRun = new docx.TextRun({ text: "example" });
      mockContext.current = [textRun];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.children).toContain(textRun);
    });

    it("should set heading if headingLevel is present", () => {
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_1;
      mockContext.current = [new docx.TextRun({ text: "heading" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.heading).toBe(docx.HeadingLevel.HEADING_1);
    });

    it("should not set heading if headingLevel is null", () => {
      mockContext.current = [new docx.TextRun({ text: "text" })];
      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.heading).toBeUndefined();
    });

    it("should add left border for quote", () => {
      mockContext.style.quote = true;
      mockContext.current = [new docx.TextRun({ text: "quoted" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.border.left).toBeDefined();
      expect(paragraph.border.right).toBeUndefined();
    });

    it("should set quote border color from style", () => {
      mockContext.style.quote = true;
      mockContext.style.blockColor = "FF0000";
      mockContext.current = [new docx.TextRun({ text: "quote" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.border.left.color).toBe("FF0000");
    });

    it("should set quote border properties", () => {
      mockContext.style.quote = true;
      mockContext.current = [new docx.TextRun({ text: "quote" })];

      groupParagraph.call(mockContext);

      const border = mockContext.paragraphs[0].border.left;
      expect(border.space).toBe(4);
      expect(border.style).toBe("single");
      expect(border.size).toBe(Math.floor(22 / 2));
    });

    it("should not add border for non-quotes", () => {
      mockContext.style.quote = false;
      mockContext.current = [new docx.TextRun({ text: "text" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.border).toBeUndefined();
    });

    it("should add all borders for code block", () => {
      mockContext.style.code = true;
      mockContext.current = [new docx.TextRun({ text: "code" })];

      groupParagraph.call(mockContext);

      const border = mockContext.paragraphs[0].border;
      expect(border.left).toBeDefined();
      expect(border.right).toBeDefined();
      expect(border.top).toBeDefined();
      expect(border.bottom).toBeDefined();
    });

    it("should set code border properties", () => {
      mockContext.style.code = true;
      mockContext.current = [new docx.TextRun({ text: "code" })];

      groupParagraph.call(mockContext);

      const border = mockContext.paragraphs[0].border.left;
      expect(border.space).toBe(4);
      expect(border.style).toBe("single");
      expect(border.size).toBe(Math.floor(22 / 2));
    });

    it("should use same border for all sides in code block", () => {
      mockContext.style.code = true;
      mockContext.current = [new docx.TextRun({ text: "code" })];

      groupParagraph.call(mockContext);

      const borders = mockContext.paragraphs[0].border;
      expect(borders.left.color).toBe(borders.right.color);
      expect(borders.left.space).toBe(borders.bottom.space);
      expect(borders.left.style).toBe(borders.top.style);
    });

    it("should not add border for non-code blocks", () => {
      mockContext.style.code = false;
      mockContext.current = [new docx.TextRun({ text: "text" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.border).toBeUndefined();
    });

    it("should add indent for non-zero indentLevel", () => {
      mockContext.style.indentLevel = 2;
      mockContext.style.indentSize = 220;
      mockContext.current = [new docx.TextRun({ text: "indented" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.indent.left).toBe(440);
    });

    it("should not add indent for zero indentLevel", () => {
      mockContext.style.indentLevel = 0;
      mockContext.current = [new docx.TextRun({ text: "text" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.indent).toBeUndefined();
    });

    it("should calculate indent correctly", () => {
      mockContext.style.indentLevel = 3;
      mockContext.style.indentSize = 100;
      mockContext.current = [new docx.TextRun({ text: "text" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.indent.left).toBe(300);
    });

    it("should clear current array after adding paragraph", () => {
      mockContext.current = [new docx.TextRun({ text: "text" })];
      groupParagraph.call(mockContext);

      expect(mockContext.current.length).toBe(0);
    });

    it("should handle paragraph with heading and indent", () => {
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_2;
      mockContext.style.indentLevel = 1;
      mockContext.style.indentSize = 220;
      mockContext.current = [new docx.TextRun({ text: "heading" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.heading).toBe(docx.HeadingLevel.HEADING_2);
      expect(paragraph.indent.left).toBe(220);
    });

    it("should handle quote with indent", () => {
      mockContext.style.quote = true;
      mockContext.style.indentLevel = 2;
      mockContext.style.indentSize = 220;
      mockContext.current = [new docx.TextRun({ text: "quote" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.border.left).toBeDefined();
      expect(paragraph.indent.left).toBe(440);
    });

    it("should handle code block with indent", () => {
      mockContext.style.code = true;
      mockContext.style.indentLevel = 1;
      mockContext.style.indentSize = 220;
      mockContext.current = [new docx.TextRun({ text: "code" })];

      groupParagraph.call(mockContext);

      const paragraph = mockContext.paragraphs[0];
      expect(paragraph.border.left).toBeDefined();
      expect(paragraph.indent.left).toBe(220);
    });

    it("should add multiple paragraphs sequentially", () => {
      const text1 = new docx.TextRun({ text: "para1" });
      const text2 = new docx.TextRun({ text: "para2" });

      mockContext.current = [text1];
      groupParagraph.call(mockContext);

      mockContext.current = [text2];
      groupParagraph.call(mockContext);

      expect(mockContext.paragraphs.length).toBe(2);
    });
  });
});
