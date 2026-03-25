const {
  getDefaultStyle,
  getHeadingMap,
  pushStyle,
  popStyle,
  updateStyle,
  setTextStyle,
} = require("../../helpers/styles");
const docx = require("docx");

describe("styles.js helpers", () => {
  let mockContext;

  beforeEach(() => {
    const defaultStyle = getDefaultStyle();

    mockContext = {
      style: { ...defaultStyle },
      styleStack: [],
      updateStyle: jest.fn(function(partial = {}) {
        this.style = {
          ...this.style,
          ...partial,
        };
      }),
    };
  });

  describe("DEFAULT_STYLE getter", () => {
    it("should have default font Arial", () => {
      expect(getDefaultStyle().font).toBe("Arial");
    });

    it("should have default text color", () => {
      expect(getDefaultStyle().textColor).toBe("333333");
    });

    it("should have default link color", () => {
      expect(getDefaultStyle().linkColor).toBe("0000EE");
    });

    it("should have default block color", () => {
      expect(getDefaultStyle().blockColor).toBe("858585");
    });

    it("should have empty prefix by default", () => {
      expect(getDefaultStyle().prefix).toBe("");
    });

    it("should have default font size of 22", () => {
      expect(getDefaultStyle().fontSize).toBe(22);
    });

    it("should have default indent level of 0", () => {
      expect(getDefaultStyle().indentLevel).toBe(0);
    });

    it("should have all text styles set to false by default", () => {
      const style = getDefaultStyle();
      expect(style.bold).toBe(false);
      expect(style.italics).toBe(false);
      expect(style.strike).toBe(false);
      expect(style.code).toBe(false);
      expect(style.quote).toBe(false);
    });

    it("should have ordered set to false by default", () => {
      expect(getDefaultStyle().ordered).toBe(false);
    });

    it("should have heading level and link as null", () => {
      const style = getDefaultStyle();
      expect(style.headingLevel).toBeNull();
      expect(style.link).toBeNull();
    });

    it("should return a copy from getDefaultStyle", () => {
      const style = getDefaultStyle();
      const styleAgain = getDefaultStyle();

      expect(style).toEqual(styleAgain);
      expect(style).not.toBe(styleAgain);
    });

    it("should not expose setDefaultStyle", () => {
      expect(typeof require("../../helpers/styles").setDefaultStyle).toBe("undefined");
    });
  });

  describe("HEADING_MAP getter", () => {
    it("should have 7 elements (index 0-6)", () => {
      expect(getHeadingMap().length).toBe(7);
    });

    it("should have null at index 0", () => {
      expect(getHeadingMap()[0]).toBeNull();
    });

    it("should map index 1 to HEADING_1", () => {
      expect(getHeadingMap()[1]).toBe(docx.HeadingLevel.HEADING_1);
    });

    it("should map index 2 to HEADING_2", () => {
      expect(getHeadingMap()[2]).toBe(docx.HeadingLevel.HEADING_2);
    });

    it("should map index 3 to HEADING_3", () => {
      expect(getHeadingMap()[3]).toBe(docx.HeadingLevel.HEADING_3);
    });

    it("should map index 4 to HEADING_4", () => {
      expect(getHeadingMap()[4]).toBe(docx.HeadingLevel.HEADING_4);
    });

    it("should map index 5 to HEADING_5", () => {
      expect(getHeadingMap()[5]).toBe(docx.HeadingLevel.HEADING_5);
    });

    it("should map index 6 to HEADING_6", () => {
      expect(getHeadingMap()[6]).toBe(docx.HeadingLevel.HEADING_6);
    });

    it("should return a copy from getHeadingMap", () => {
      const headingMap = getHeadingMap();
      const headingMapAgain = getHeadingMap();

      expect(headingMap).toEqual(headingMapAgain);
      expect(headingMap).not.toBe(headingMapAgain);
    });

    it("should not expose setHeadingMap", () => {
      expect(typeof require("../../helpers/styles").setHeadingMap).toBe("undefined");
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
    it("should throw if styleStack is empty", () => {
      mockContext.styleStack = [];
      expect(() => {
        popStyle.call(mockContext);
      }).toThrow("Style stack underflow: no styles to pop");
    });

    it("should throw if styleStack is undefined", () => {
      delete mockContext.styleStack;
      expect(() => {
        popStyle.call(mockContext);
      }).toThrow("Style stack underflow: no styles to pop");
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

    it("should update fontSize", () => {
      updateStyle.call(mockContext, { fontSize: 20 });

      expect(mockContext.style.fontSize).toBe(20);
    });

    it("should work with empty partial", () => {
      const original = { ...mockContext.style };
      updateStyle.call(mockContext, {});

      expect(mockContext.style.fontSize).toBe(original.fontSize);
    });

    it("should update values on repeated calls", () => {
      updateStyle.call(mockContext, { fontSize: 22 });
      expect(mockContext.style.fontSize).toBe(22);

      updateStyle.call(mockContext, { fontSize: 24 });
      expect(mockContext.style.fontSize).toBe(24);
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
