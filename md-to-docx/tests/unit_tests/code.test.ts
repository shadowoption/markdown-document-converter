const { writeCode, writeCodeSpan } = require("../../helpers/code");
const docx = require("docx");

describe("code.js helpers", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      _current: [],
      style: {
        font: "Arial",
        indentLevel: 0,
        fontSize: 22,
      },
      groupParagraph: jest.fn(),
      updateStyle: jest.fn(function(partial) {
        this.style = { ...this.style, ...partial };
      }),
      writeText: jest.fn(function(text) {
        const currentTextRuns = this.getCurrentTextRuns();
        currentTextRuns.push(new docx.TextRun({ text }));
        this.setCurrentTextRuns(currentTextRuns);
      }),
      lineBreak: jest.fn(function() {
        const currentTextRuns = this.getCurrentTextRuns();
        currentTextRuns.push(new docx.TextRun({ break: 1 }));
        this.setCurrentTextRuns(currentTextRuns);
      }),
      getCurrentTextRuns() {
        return this._current;
      },
      setCurrentTextRuns(currentTextRuns) {
        this._current = currentTextRuns;
      },
    };
  });

  describe("writeCode", () => {
    it("should group paragraph before and after writing code", () => {
      const token = { lines: [], codeBlockStyle: false };
      writeCode.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalledTimes(2);
    });

    it("should update style with Consolas font and code flag", () => {
      const token = { lines: [], codeBlockStyle: false };
      writeCode.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        font: "Consolas",
        code: true,
      });
    });

    it("should write each line of code", () => {
      const lines = ["line 1", "line 2", "line 3"];
      const token = { lines, codeBlockStyle: false };
      writeCode.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledTimes(3);
      expect(mockContext.writeText).toHaveBeenNthCalledWith(1, "line 1");
      expect(mockContext.writeText).toHaveBeenNthCalledWith(2, "line 2");
      expect(mockContext.writeText).toHaveBeenNthCalledWith(3, "line 3");
    });

    it("should break line after each code line", () => {
      const lines = ["line 1", "line 2"];
      const token = { lines, codeBlockStyle: false };
      writeCode.call(mockContext, token);

      expect(mockContext.lineBreak).toHaveBeenCalledTimes(2);
    });

    it("should increment indent level when codeBlockStyle is true", () => {
      const token = { lines: ["code"], codeBlockStyle: true };
      writeCode.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          indentLevel: 1,
        })
      );
    });

    it("should increment indent level when codeBlockStyle is false", () => {
      const token = { lines: ["code"], codeBlockStyle: false };
      writeCode.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          indentLevel: 1,
        })
      );
    });

    it("should handle empty lines array", () => {
      const token = { lines: [], codeBlockStyle: false };
      writeCode.call(mockContext, token);

      expect(mockContext.writeText).not.toHaveBeenCalled();
      expect(mockContext.lineBreak).not.toHaveBeenCalled();
    });
  });

  describe("writeCodeSpan", () => {
    it("should update style with Consolas font", () => {
      const token = { text: "console.log()" };
      writeCodeSpan.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        font: "Consolas",
      });
    });

    it("should write the code text", () => {
      const token = { text: "const x = 5;" };
      writeCodeSpan.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith("const x = 5;");
    });

    it("should handle empty code span text", () => {
      const token = { text: "" };
      writeCodeSpan.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith("");
    });

    it("should handle code span with special characters", () => {
      const token = { text: "<div>Hello</div>" };
      writeCodeSpan.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith("<div>Hello</div>");
    });
  });
});
