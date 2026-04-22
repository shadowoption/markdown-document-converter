const { writeText } = require("../../helpers/text");
const docx = require("docx");

describe("text.js helpers", () => {
  let mockContext;
  let textRunSpy;

  beforeEach(() => {
    mockContext = {
      _current: [],
      style: {
        text: "text",
        font: "Arial",
        bold: false,
        headingLevel: null,
        textColor: "333333",
        fontSize: 22,
        italics: false,
        strike: false,
        link: null,
      },
      getCurrentTextRuns() {
        return this._current;
      },
      setCurrentTextRuns(currentTextRuns) {
        this._current = currentTextRuns;
      },
    };

    // Mock TextRun constructor to capture options
    textRunSpy = jest.spyOn(docx, "TextRun").mockImplementation(function(options) {
      this.options = options;
      this.text = options?.text;
      this.font = options?.font;
      this.bold = options?.bold;
      this.color = options?.color;
      this.size = options?.size;
      this.italics = options?.italics;
      this.strike = options?.strike;
      this.style = options?.style;
      this.break = options?.break;
    });
  });

  afterEach(() => {
    textRunSpy.mockRestore();
  });

  describe("writeText", () => {
    it("should add TextRun to current array", () => {
      writeText.call(mockContext, "Hello");

      expect(mockContext.getCurrentTextRuns().length).toBe(1);
      expect(mockContext.getCurrentTextRuns()[0] instanceof docx.TextRun).toBe(true);
    });

    it("should set text in TextRun", () => {
      writeText.call(mockContext, "Hello World");

      expect(mockContext.getCurrentTextRuns()[0].text).toBe("Hello World");
    });

    it("should set font from style", () => {
      mockContext.style.font = "Courier";
      writeText.call(mockContext, "code");

      expect(mockContext.getCurrentTextRuns()[0].font).toBe("Courier");
    });

    it("should set bold from style", () => {
      mockContext.style.bold = true;
      writeText.call(mockContext, "bold text");

      expect(mockContext.getCurrentTextRuns()[0].bold).toBe(true);
    });

    it("should not set color and italics for headings", () => {
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_1;
      mockContext.style.textColor = "FF0000";
      mockContext.style.italics = true;
      writeText.call(mockContext, "heading");

      const textRun = mockContext.getCurrentTextRuns()[0];
      expect(textRun.color).toBeUndefined();
      expect(textRun.italics).toBeUndefined();
      expect(textRun.strike).toBeUndefined();
    });

    it("should set color for non-heading text", () => {
      mockContext.style.headingLevel = null;
      mockContext.style.textColor = "FF0000";
      writeText.call(mockContext, "colored");

      expect(mockContext.getCurrentTextRuns()[0].color).toBe("FF0000");
    });

    it("should set italics for non-heading text", () => {
      mockContext.style.headingLevel = null;
      mockContext.style.italics = true;
      writeText.call(mockContext, "italic");

      expect(mockContext.getCurrentTextRuns()[0].italics).toBe(true);
    });

    it("should set strike through for non-heading text", () => {
      mockContext.style.headingLevel = null;
      mockContext.style.strike = true;
      writeText.call(mockContext, "strikethrough");

      expect(mockContext.getCurrentTextRuns()[0].strike).toBe(true);
    });

    it("should set size for non-heading text", () => {
      mockContext.style.fontSize = 24;
      writeText.call(mockContext, "sized");

      expect(mockContext.getCurrentTextRuns()[0].size).toBe(24);
    });

    it("should not set size for heading text", () => {
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_2;
      mockContext.style.fontSize = 28;
      writeText.call(mockContext, "heading");

      expect(mockContext.getCurrentTextRuns()[0].size).toBeUndefined();
    });

    it("should set style to Hyperlink when link is present", () => {
      mockContext.style.link = "https://example.com";
      writeText.call(mockContext, "link text");

      expect(mockContext.getCurrentTextRuns()[0].style).toBe("Hyperlink");
    });

    it("should not set style to Hyperlink when no link", () => {
      mockContext.style.link = null;
      writeText.call(mockContext, "normal text");

      expect(mockContext.getCurrentTextRuns()[0].style).toBeUndefined();
    });

    it("should handle empty text", () => {
      writeText.call(mockContext, "");

      expect(mockContext.getCurrentTextRuns()[0].text).toBe("");
    });

    it("should handle special characters", () => {
      writeText.call(mockContext, "<script>alert('xss')</script>");

      expect(mockContext.getCurrentTextRuns()[0].text).toBe("<script>alert('xss')</script>");
    });

    it("should handle multiline text", () => {
      writeText.call(mockContext, "Line 1\nLine 2\nLine 3");

      const runs = mockContext.getCurrentTextRuns();

      expect(runs.length).toBe(5);
      expect(runs[0].text).toBe("Line 1");
      expect(runs[1].break).toBe(1);
      expect(runs[2].text).toBe("Line 2");
      expect(runs[3].break).toBe(1);
      expect(runs[4].text).toBe("Line 3");
    });

    it("should add multiple TextRuns to current", () => {
      writeText.call(mockContext, "First");
      writeText.call(mockContext, "Second");

      expect(mockContext.getCurrentTextRuns().length).toBe(2);
      expect(mockContext.getCurrentTextRuns()[0].text).toBe("First");
      expect(mockContext.getCurrentTextRuns()[1].text).toBe("Second");
    });

    it("should handle text with bold and heading", () => {
      mockContext.style.bold = true;
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_1;
      writeText.call(mockContext, "bold heading");

      const textRun = mockContext.getCurrentTextRuns()[0];
      expect(textRun.bold).toBe(true);
      expect(textRun.color).toBeUndefined();
      expect(textRun.size).toBeUndefined();
    });

    it("should handle text with all formatting options", () => {
      mockContext.style = {
        font: "Consolas",
        bold: true,
        headingLevel: null,
        textColor: "FF0000",
        fontSize: 20,
        italics: true,
        strike: false,
        link: "https://example.com",
      };
      writeText.call(mockContext, "formatted");

      const textRun = mockContext.getCurrentTextRuns()[0];
      expect(textRun.text).toBe("formatted");
      expect(textRun.font).toBe("Consolas");
      expect(textRun.bold).toBe(true);
      expect(textRun.color).toBe("FF0000");
      expect(textRun.size).toBe(20);
      expect(textRun.italics).toBe(true);
      expect(textRun.strike).toBe(false);
      expect(textRun.style).toBe("Hyperlink");
    });

    it("should preserve existing current when adding new text", () => {
      const first = new docx.TextRun({ text: "first" });
      mockContext.setCurrentTextRuns([first]);

      writeText.call(mockContext, "second");

      expect(mockContext.getCurrentTextRuns().length).toBe(2);
      expect(mockContext.getCurrentTextRuns()[0]).toBe(first);
      expect(mockContext.getCurrentTextRuns()[1].text).toBe("second");
    });

    it("should handle strike through with other styles", () => {
      mockContext.style.strike = true;
      mockContext.style.bold = true;
      mockContext.style.italics = true;
      writeText.call(mockContext, "struck");

      const textRun = mockContext.getCurrentTextRuns()[0];
      expect(textRun.strike).toBe(true);
      expect(textRun.bold).toBe(true);
      expect(textRun.italics).toBe(true);
    });

    it("should not set strike for heading", () => {
      mockContext.style.strike = true;
      mockContext.style.headingLevel = docx.HeadingLevel.HEADING_3;
      writeText.call(mockContext, "heading");

      expect(mockContext.getCurrentTextRuns()[0].strike).toBeUndefined();
    });

    it("should handle unicode text", () => {
      writeText.call(mockContext, "Hello 世界 مرحبا");

      expect(mockContext.getCurrentTextRuns()[0].text).toBe("Hello 世界 مرحبا");
    });

    it("should handle very long text", () => {
      const longText = "a".repeat(10000);
      writeText.call(mockContext, longText);

      expect(mockContext.getCurrentTextRuns()[0].text).toBe(longText);
    });
  });
});
