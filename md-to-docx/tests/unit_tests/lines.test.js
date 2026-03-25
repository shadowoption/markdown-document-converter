const { horizontalLine, breakLine } = require("../../helpers/lines");
const docx = require("docx");

describe("lines.js helpers", () => {
  let mockContext;
  let paragraphSpy;
  let textRunSpy;

  beforeEach(() => {
    mockContext = {
      _paragraphs: [],
      _current: [],
      style: {
        blockColor: "858585",
        fontSize: 22,
      },
      getParagraphs() {
        return this._paragraphs;
      },
      setParagraphs(paragraphs) {
        this._paragraphs = paragraphs;
      },
      getCurrent() {
        return this._current;
      },
      setCurrent(current) {
        this._current = current;
      },
    };

    // Spy on docx constructors to capture options
    paragraphSpy = jest.spyOn(docx, "Paragraph").mockImplementation(function(options) {
      this.options = options;
      this.border = options?.border;
    });

    textRunSpy = jest.spyOn(docx, "TextRun").mockImplementation(function(options) {
      this.options = options;
      this.text = options?.text;
      this.size = options?.size;
      this.break = options?.break;
    });
  });

  afterEach(() => {
    paragraphSpy.mockRestore();
    textRunSpy.mockRestore();
  });

  describe("horizontalLine", () => {
    it("should add a paragraph to paragraphs array", () => {
      horizontalLine.call(mockContext);

      expect(mockContext.getParagraphs().length).toBe(1);
      expect(paragraphSpy).toHaveBeenCalled();
    });

    it("should create paragraph with bottom border", () => {
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.bottom).toBeDefined();
    });

    it("should set border color from blockColor style", () => {
      mockContext.style.blockColor = "FF0000";
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.bottom.color).toBe("FF0000");
    });

    it("should set border color to default blockColor", () => {
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.bottom.color).toBe("858585");
    });

    it("should set border space to 1", () => {
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.bottom.space).toBe(1);
    });

    it("should set border style to single", () => {
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.bottom.style).toBe("single");
    });

    it("should set border size to 6", () => {
      mockContext.style.fontSize = 44;
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.bottom.size).toBe(6);
    });

    it("should set border size to 6 regardless of font size", () => {
      mockContext.style.fontSize = 5;
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.bottom.size).toBe(6);
    });

    it("should only add bottom border", () => {
      horizontalLine.call(mockContext);

      const paragraph = mockContext.getParagraphs()[0];
      expect(paragraph.border.left).toBeUndefined();
      expect(paragraph.border.right).toBeUndefined();
      expect(paragraph.border.top).toBeUndefined();
      expect(paragraph.border.bottom).toBeDefined();
    });

    it("should add multiple horizontal lines independently", () => {
      horizontalLine.call(mockContext);
      horizontalLine.call(mockContext);

      expect(mockContext.getParagraphs().length).toBe(2);
    });
  });

  describe("breakLine", () => {
    it("should add a TextRun to current array", () => {
      breakLine.call(mockContext);

      expect(mockContext.getCurrent().length).toBe(1);
      expect(textRunSpy).toHaveBeenCalled();
    });

    it("should create TextRun with empty text", () => {
      breakLine.call(mockContext);

      const textRun = mockContext.getCurrent()[0];
      expect(textRun.text).toBe("");
    });

    it("should set font size from style", () => {
      mockContext.style.fontSize = 28;
      breakLine.call(mockContext);

      const textRun = mockContext.getCurrent()[0];
      expect(textRun.size).toBe(28);
    });

    it("should set break to 1", () => {
      breakLine.call(mockContext);

      const textRun = mockContext.getCurrent()[0];
      expect(textRun.break).toBe(1);
    });

    it("should use default fontSize if not set", () => {
      mockContext.style.fontSize = 22;
      breakLine.call(mockContext);

      const textRun = mockContext.getCurrent()[0];
      expect(textRun.size).toBe(22);
    });

    it("should add multiple break lines", () => {
      breakLine.call(mockContext);
      breakLine.call(mockContext);
      breakLine.call(mockContext);

      expect(mockContext.getCurrent().length).toBe(3);
    });

    it("should append to existing current array", () => {
      const existing = new docx.TextRun({ text: "existing" });
      mockContext.setCurrent([existing]);

      breakLine.call(mockContext);

      expect(mockContext.getCurrent().length).toBe(2);
      expect(mockContext.getCurrent()[0]).toBe(existing);
    });

    it("should work with various font sizes", () => {
      const sizes = [11, 14, 20, 28, 36];

      sizes.forEach((size) => {
        mockContext.style.fontSize = size;
        mockContext.setCurrent([]);
        breakLine.call(mockContext);

        expect(mockContext.getCurrent()[0].size).toBe(size);
      });
    });
  });
});
