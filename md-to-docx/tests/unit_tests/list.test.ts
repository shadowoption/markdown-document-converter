const { writeCheckBox, writeList, writeListItem } = require("../../helpers/list");
const docx = require("docx");

describe("list.js helpers", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      _current: [],
      style: {
        indentLevel: 0,
        ordered: false,
      },
      groupParagraph: jest.fn(),
      updateStyle: jest.fn(function(partial) {
        this.style = { ...this.style, ...partial };
      }),
      DFS: jest.fn(),
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

  describe("writeCheckBox", () => {
    it("should push a CheckBox element with checked state", () => {
      const token = { checked: true };
      writeCheckBox.call(mockContext, token);

      expect(mockContext.getCurrentTextRuns().length).toBe(1);
      expect(mockContext.getCurrentTextRuns()[0] instanceof docx.CheckBox).toBe(true);
    });

    it("should handle unchecked checkbox", () => {
      const token = { checked: false };
      writeCheckBox.call(mockContext, token);

      expect(mockContext.getCurrentTextRuns().length).toBe(1);
      expect(mockContext.getCurrentTextRuns()[0] instanceof docx.CheckBox).toBe(true);
    });

    it("should keep writing checkbox without relying on style prefix", () => {
      const token = { checked: true };
      writeCheckBox.call(mockContext, token);

      expect(mockContext.getCurrentTextRuns()[0] instanceof docx.CheckBox).toBe(true);
    });
  });

  describe("writeList", () => {
    it("should group paragraph before and after list", () => {
      const token = {
        ordered: false,
        start: 1,
        items: [],
      };
      writeList.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalled();
    });

    it("should assign bullet prefix on each unordered list item", () => {
      const token = {
        ordered: false,
        start: 1,
        items: [{ type: "list_item", tokens: [] }],
      };
      writeList.call(mockContext, token);

      expect(token.items[0].prefix).toBe("\u2022 ");
    });

    it("should increment indent level", () => {
      mockContext.style.indentLevel = 1;
      const token = {
        ordered: false,
        start: 1,
        items: [],
      };
      writeList.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          indentLevel: 2,
        })
      );
    });

    it("should process each list item with DFS", () => {
      const item1 = { type: "list_item", tokens: [] };
      const item2 = { type: "list_item", tokens: [] };
      const token = {
        ordered: false,
        start: 1,
        items: [item1, item2],
      };
      writeList.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith([item1]);
      expect(mockContext.DFS).toHaveBeenCalledWith([item2]);
      expect(mockContext.DFS).toHaveBeenCalledTimes(2);
    });

    it("should group paragraph after each item", () => {
      const token = {
        ordered: false,
        start: 1,
        items: [{ type: "list_item", tokens: [] }],
      };
      writeList.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalledTimes(2);
    });

    it("should handle ordered lists with correct numbering", () => {
      mockContext.style.ordered = false;
      const item1 = { type: "list_item", tokens: [] };
      const item2 = { type: "list_item", tokens: [] };
      const token = {
        ordered: true,
        start: 1,
        items: [item1, item2],
      };
      writeList.call(mockContext, token);

      // First call sets up the list with ordered flag
      expect(mockContext.updateStyle).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          ordered: true,
        })
      );

      expect(item1.prefix).toBe("1. ");
      expect(item2.prefix).toBe("2. ");
    });

    it("should handle ordered lists starting from different number", () => {
      const token = {
        ordered: true,
        start: 5,
        items: [{ type: "list_item", tokens: [] }],
      };
      writeList.call(mockContext, token);

      expect(token.items[0].prefix).toBe("5. ");
    });

    it("should default ordered list numbering to 1 when start is empty", () => {
      const token = {
        ordered: true,
        start: "",
        items: [{ type: "list_item", tokens: [] }],
      };
      writeList.call(mockContext, token);

      expect(token.items[0].prefix).toBe("1. ");
    });

    it("should handle empty items array", () => {
      const token = {
        ordered: false,
        start: 1,
        items: [],
      };
      writeList.call(mockContext, token);

      expect(mockContext.DFS).not.toHaveBeenCalled();
    });
  });

  describe("writeListItem", () => {
    it("should not break line for non-loose items", () => {
      const token = { loose: false, task: false, tokens: [] };
      writeListItem.call(mockContext, token);

      expect(mockContext.lineBreak).not.toHaveBeenCalled();
    });

    it("should break line for loose items", () => {
      const token = { loose: true, task: false, tokens: [] };
      writeListItem.call(mockContext, token);

      expect(mockContext.lineBreak).toHaveBeenCalled();
    });

    it("should write checkbox for task list items", () => {
      mockContext.writeCheckBox = jest.fn();
      const token = { loose: false, task: true, tokens: [], checked: false };
      writeListItem.call(mockContext, token);

      expect(mockContext.writeCheckBox).toHaveBeenCalled();
    });

    it("should not write checkbox for non-task items", () => {
      mockContext.writeCheckBox = jest.fn();
      const token = { loose: false, task: false, tokens: [] };
      writeListItem.call(mockContext, token);

      expect(mockContext.writeCheckBox).not.toHaveBeenCalled();
    });

    it("should write the prefix text", () => {
      const token = { loose: false, task: false, prefix: "• ", tokens: [] };
      writeListItem.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith("• ");
    });

    it("should not reset style prefix after writing", () => {
      const token = { loose: false, task: false, prefix: "1. ", tokens: [] };
      writeListItem.call(mockContext, token);

      expect(mockContext.updateStyle).not.toHaveBeenCalledWith({ prefix: "" });
    });

    it("should process nested tokens using DFS", () => {
      const tokens = [{ type: "text", text: "item text" }];
      const token = { loose: false, task: false, prefix: "• ", tokens };
      writeListItem.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(tokens);
    });

    it("should handle list items with no tokens", () => {
      const token = { loose: false, task: false, prefix: "• ", tokens: [] };
      writeListItem.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should handle task list item with checked state", () => {
      mockContext.writeCheckBox = jest.fn();
      const token = {
        loose: false,
        task: true,
        prefix: "☐ ",
        tokens: [],
        checked: true,
      };
      writeListItem.call(mockContext, token);

      expect(mockContext.writeCheckBox).toHaveBeenCalledWith(token);
    });
  });
});
