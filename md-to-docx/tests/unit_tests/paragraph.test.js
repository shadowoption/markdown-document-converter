const { groupParagraph } = require("../../helpers/paragraph");
const docx = require("docx");

describe("paragraph.js helpers", () => {
  let mockContext;
  let paragraphSpy;

  const makeRun = (text) => new docx.TextRun({ text });

  beforeEach(() => {
    mockContext = {
      _current: [],
      _paragraphs: [],
      style: {
        headingLevel: null,
        quote: false,
        code: false,
        indentLevel: 0,
        blockColor: "858585",
        fontSize: 22,
      },
      getCurrent() {
        return this._current;
      },
      setCurrent(current) {
        this._current = current;
      },
      getParagraphs() {
        return this._paragraphs;
      },
      setParagraphs(paragraphs) {
        this._paragraphs = paragraphs;
      },
    };

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
    const getParagraph = () => mockContext.getParagraphs()[0];

    it("should not add paragraph if current is empty", () => {
      groupParagraph.call(mockContext);
      expect(mockContext.getParagraphs().length).toBe(0);
    });

    it("should add paragraph to paragraphs array", () => {
      mockContext.setCurrent([makeRun("text")]);
      groupParagraph.call(mockContext);
      expect(mockContext.getParagraphs().length).toBe(1);
      expect(getParagraph() instanceof docx.Paragraph).toBe(true);
    });

    it("should create paragraph with current children", () => {
      const textRun = makeRun("example");
      mockContext.setCurrent([textRun]);
      groupParagraph.call(mockContext);
      expect(getParagraph().children).toContain(textRun);
    });

    it("should set heading if headingLevel is present", () => {
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_1;
      mockContext.setCurrent([makeRun("heading")]);
      groupParagraph.call(mockContext);
      expect(getParagraph().heading).toBe(docx.HeadingLevel.HEADING_1);
    });

    it("should add left border for quote", () => {
      mockContext.style.quote = true;
      mockContext.setCurrent([makeRun("quote")]);
      groupParagraph.call(mockContext);
      expect(getParagraph().border.left).toBeDefined();
      expect(getParagraph().border.right).toBeUndefined();
    });

    it("should set quote border properties", () => {
      mockContext.style.quote = true;
      mockContext.setCurrent([makeRun("quote")]);
      groupParagraph.call(mockContext);
      const border = getParagraph().border.left;
      expect(border.space).toBe(4);
      expect(border.style).toBe("single");
      expect(border.size).toBe(Math.floor(22 / 2));
    });

    it("should add all borders for code block", () => {
      mockContext.style.code = true;
      mockContext.setCurrent([makeRun("code")]);
      groupParagraph.call(mockContext);
      const border = getParagraph().border;
      expect(border.left).toBeDefined();
      expect(border.right).toBeDefined();
      expect(border.top).toBeDefined();
      expect(border.bottom).toBeDefined();
    });

    it("should add indent for non-zero indentLevel", () => {
      mockContext.style.indentLevel = 2;
      mockContext.setCurrent([makeRun("indented")]);
      groupParagraph.call(mockContext);
      expect(getParagraph().indent.left).toBe(440);
    });

    it("should clear current array after adding paragraph", () => {
      mockContext.setCurrent([makeRun("text")]);
      groupParagraph.call(mockContext);
      expect(mockContext.getCurrent().length).toBe(0);
    });

    it("should handle heading and indent together", () => {
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_2;
      mockContext.style.indentLevel = 1;
      mockContext.setCurrent([makeRun("heading")]);
      groupParagraph.call(mockContext);
      expect(getParagraph().heading).toBe(docx.HeadingLevel.HEADING_2);
      expect(getParagraph().indent.left).toBe(220);
    });

    it("should add multiple paragraphs sequentially", () => {
      mockContext.setCurrent([makeRun("para1")]);
      groupParagraph.call(mockContext);
      mockContext.setCurrent([makeRun("para2")]);
      groupParagraph.call(mockContext);
      expect(mockContext.getParagraphs().length).toBe(2);
    });
  });
});
