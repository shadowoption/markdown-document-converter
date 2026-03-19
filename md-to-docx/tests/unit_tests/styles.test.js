const {
  DEFAULT_STYLE,
  HEADING_MAP,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
} = require("../../helpers/styles");
const docx = require("docx");

describe("styles.js helpers", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      style: { ...DEFAULT_STYLE },
      styleStack: [],
      updateStyle: jest.fn(function(partial = {}) {
        this.style = {
          ...this.style,
          ...partial,
        };
        this.style.indentSize = this.style.fontSize * 10;
      }),
    };
  });

  describe("DEFAULT_STYLE constant", () => {
    it("should have default font Arial", () => {
      expect(DEFAULT_STYLE.font).toBe("Arial");
    });

    it("should have default text color", () => {
      expect(DEFAULT_STYLE.textColor).toBe("333333");
    });

    it("should have default link color", () => {
      expect(DEFAULT_STYLE.linkColor).toBe("0000EE");
    });

    it("should have default block color", () => {
      expect(DEFAULT_STYLE.blockColor).toBe("858585");
    });

    it("should have empty prefix by default", () => {
      expect(DEFAULT_STYLE.prefix).toBe("");
    });

    it("should have default font size of 22", () => {
      expect(DEFAULT_STYLE.fontSize).toBe(22);
    });

    it("should have default indent level of 0", () => {
      expect(DEFAULT_STYLE.indentLevel).toBe(0);
    });

    it("should have all text styles set to false by default", () => {
      expect(DEFAULT_STYLE.bold).toBe(false);
      expect(DEFAULT_STYLE.italics).toBe(false);
      expect(DEFAULT_STYLE.strike).toBe(false);
      expect(DEFAULT_STYLE.code).toBe(false);
      expect(DEFAULT_STYLE.quote).toBe(false);
    });

    it("should have ordered set to false by default", () => {
      expect(DEFAULT_STYLE.ordered).toBe(false);
    });

    it("should have heading level and link as null", () => {
      expect(DEFAULT_STYLE.headingLevel).toBeNull();
      expect(DEFAULT_STYLE.link).toBeNull();
    });
  });

  describe("HEADING_MAP constant", () => {
    it("should have 7 elements (index 0-6)", () => {
      expect(HEADING_MAP.length).toBe(7);
    });

    it("should have null at index 0", () => {
      expect(HEADING_MAP[0]).toBeNull();
    });

    it("should map index 1 to HEADING_1", () => {
      expect(HEADING_MAP[1]).toBe(docx.HeadingLevel.HEADING_1);
    });

    it("should map index 2 to HEADING_2", () => {
      expect(HEADING_MAP[2]).toBe(docx.HeadingLevel.HEADING_2);
    });

    it("should map index 3 to HEADING_3", () => {
      expect(HEADING_MAP[3]).toBe(docx.HeadingLevel.HEADING_3);
    });

    it("should map index 4 to HEADING_4", () => {
      expect(HEADING_MAP[4]).toBe(docx.HeadingLevel.HEADING_4);
    });

    it("should map index 5 to HEADING_5", () => {
      expect(HEADING_MAP[5]).toBe(docx.HeadingLevel.HEADING_5);
    });

    it("should map index 6 to HEADING_6", () => {
      expect(HEADING_MAP[6]).toBe(docx.HeadingLevel.HEADING_6);
    });
  });

  describe("pushStyle", () => {
    it("should create styleStack if not exists", () => {
      delete mockContext.styleStack;
      pushStyle.call(mockContext);

      expect(Array.isArray(mockContext.styleStack)).toBe(true);
    });

    it("should push a copy of current style to stack", () => {
      const initialStyle = { ...mockContext.style };
      pushStyle.call(mockContext);

      expect(mockContext.styleStack.length).toBe(1);
      expect(mockContext.styleStack[0]).toEqual(initialStyle);
    });

    it("should not push reference but a copy", () => {
      pushStyle.call(mockContext);
      mockContext.style.bold = true;

      expect(mockContext.styleStack[0].bold).toBe(false);
    });

    it("should allow multiple pushes", () => {
      pushStyle.call(mockContext);
      pushStyle.call(mockContext);
      pushStyle.call(mockContext);

      expect(mockContext.styleStack.length).toBe(3);
    });

    it("should preserve all style properties when pushing", () => {
      mockContext.style = {
        font: "Courier",
        bold: true,
        fontSize: 20,
        indentLevel: 2,
      };

      pushStyle.call(mockContext);

      const pushed = mockContext.styleStack[0];
      expect(pushed.font).toBe("Courier");
      expect(pushed.bold).toBe(true);
      expect(pushed.fontSize).toBe(20);
      expect(pushed.indentLevel).toBe(2);
    });
  });

  describe("popStyle", () => {
    it("should not throw if styleStack is empty", () => {
      mockContext.styleStack = [];
      expect(() => {
        popStyle.call(mockContext);
      }).not.toThrow();
    });

    it("should not throw if styleStack is undefined", () => {
      delete mockContext.styleStack;
      expect(() => {
        popStyle.call(mockContext);
      }).not.toThrow();
    });

    it("should restore style from stack", () => {
      const originalStyle = { ...mockContext.style };
      mockContext.style.bold = true;
      mockContext.style.fontSize = 30;

      mockContext.styleStack = [originalStyle];

      popStyle.call(mockContext);

      expect(mockContext.style).toEqual(originalStyle);
    });

    it("should remove style from top of stack", () => {
      mockContext.styleStack = [{ bold: false }, { bold: true }];

      popStyle.call(mockContext);

      expect(mockContext.styleStack.length).toBe(1);
      expect(mockContext.styleStack[0].bold).toBe(false);
    });

    it("should work with push and pop pairs", () => {
      const original = { ...mockContext.style };
      pushStyle.call(mockContext);

      mockContext.style.bold = true;
      mockContext.style.fontSize = 28;

      popStyle.call(mockContext);

      expect(mockContext.style).toEqual(original);
    });

    it("should handle nested push/pop operations", () => {
      const style1 = { ...mockContext.style };

      pushStyle.call(mockContext);
      mockContext.style.bold = true;

      const style2 = { ...mockContext.style };
      pushStyle.call(mockContext);
      mockContext.style.fontSize = 30;

      popStyle.call(mockContext);
      expect(mockContext.style).toEqual(style2);

      popStyle.call(mockContext);
      expect(mockContext.style).toEqual(style1);
    });
  });

  describe("updateStyle", () => {
    it("should merge partial style into current style", () => {
      updateStyle.call(mockContext, { bold: true });

      expect(mockContext.style.bold).toBe(true);
      expect(mockContext.style.font).toBe("Arial");
    });

    it("should handle multiple properties", () => {
      updateStyle.call(mockContext, {
        bold: true,
        italics: true,
        fontSize: 28,
      });

      expect(mockContext.style.bold).toBe(true);
      expect(mockContext.style.italics).toBe(true);
      expect(mockContext.style.fontSize).toBe(28);
    });

    it("should calculate indentSize as fontSize * 10", () => {
      updateStyle.call(mockContext, { fontSize: 20 });

      expect(mockContext.style.indentSize).toBe(200);
    });

    it("should work with empty partial", () => {
      const original = { ...mockContext.style };
      updateStyle.call(mockContext, {});

      expect(mockContext.style.fontSize).toBe(original.fontSize);
    });

    it("should recalculate indentSize every time", () => {
      updateStyle.call(mockContext, { fontSize: 22 });
      expect(mockContext.style.indentSize).toBe(220);

      updateStyle.call(mockContext, { fontSize: 24 });
      expect(mockContext.style.indentSize).toBe(240);
    });

    it("should not require default parameter", () => {
      const original = { ...mockContext.style };
      updateStyle.call(mockContext);

      expect(mockContext.style.fontSize).toBe(original.fontSize);
    });

    it("should override existing properties", () => {
      mockContext.style.bold = false;
      updateStyle.call(mockContext, { bold: true });

      expect(mockContext.style.bold).toBe(true);
    });

    it("should handle complex partial updates", () => {
      updateStyle.call(mockContext, {
        font: "Consolas",
        code: true,
        indentLevel: 3,
        bold: true,
      });

      expect(mockContext.style.font).toBe("Consolas");
      expect(mockContext.style.code).toBe(true);
      expect(mockContext.style.indentLevel).toBe(3);
      expect(mockContext.style.bold).toBe(true);
    });
  });

  describe("setTextStyle", () => {
    it("should set bold when type is strong", () => {
      setTextStyle.call(mockContext, "strong");

      expect(mockContext.style.bold).toBe(true);
    });

    it("should set italics when type is em", () => {
      setTextStyle.call(mockContext, "em");

      expect(mockContext.style.italics).toBe(true);
    });

    it("should set strike through when type is del", () => {
      setTextStyle.call(mockContext, "del");

      expect(mockContext.style.strike).toBe(true);
    });

    it("should do nothing for unknown type", () => {
      const original = { ...mockContext.style };
      setTextStyle.call(mockContext, "unknown");

      expect(mockContext.style).toEqual(original);
    });

    it("should not affect other styles when setting strong", () => {
      mockContext.style.italics = true;
      setTextStyle.call(mockContext, "strong");

      expect(mockContext.style.bold).toBe(true);
      expect(mockContext.style.italics).toBe(true);
    });

    it("should be able to combine multiple text styles", () => {
      setTextStyle.call(mockContext, "strong");
      setTextStyle.call(mockContext, "em");

      expect(mockContext.style.bold).toBe(true);
      expect(mockContext.style.italics).toBe(true);
    });

    it("should handle case sensitivity", () => {
      const original = { ...mockContext.style };
      setTextStyle.call(mockContext, "Strong");

      expect(mockContext.style).toEqual(original);
    });

    it("should handle null or undefined", () => {
      expect(() => {
        setTextStyle.call(mockContext, null);
      }).not.toThrow();

      expect(() => {
        setTextStyle.call(mockContext, undefined);
      }).not.toThrow();
    });
  });
});
