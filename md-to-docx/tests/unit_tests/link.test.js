const { writeLink } = require("../../helpers/link");
const docx = require("docx");

describe("link.js helpers", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      _current: [],
      style: {
        link: null,
        linkColor: "0000EE",
        textColor: "333333",
      },
      updateStyle: jest.fn(function(partial) {
        this.style = { ...this.style, ...partial };
      }),
      DFS: jest.fn(),
      writeText: jest.fn(function(text) {
        const current = this.getCurrent();
        current.push(new docx.TextRun({ text }));
        this.setCurrent(current);
      }),
      getCurrent() {
        return this._current;
      },
      setCurrent(current) {
        this._current = current;
      },
    };
  });

  describe("writeLink", () => {
    it("should save and restore the current state", () => {
      const initialElement = new docx.TextRun({ text: "existing" });
      mockContext.setCurrent([initialElement]);

      const token = {
        href: "https://example.com",
        tokens: [],
        title: null,
      };

      writeLink.call(mockContext, token);

      expect(mockContext.getCurrent()).toContain(initialElement);
    });

    it("should update style with link href and link color", () => {
      const token = {
        href: "https://example.com",
        tokens: [],
        title: null,
      };

      writeLink.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        link: "https://example.com",
        textColor: "0000EE",
      });
    });

    it("should process nested tokens using DFS", () => {
      const nestedTokens = [{ type: "text", text: "click here" }];
      const token = {
        href: "https://example.com",
        tokens: nestedTokens,
        title: null,
      };

      writeLink.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
    });

    it("should not call DFS if tokens are not present", () => {
      const token = {
        href: "https://example.com",
        tokens: null,
        title: null,
      };

      writeLink.call(mockContext, token);

      expect(mockContext.DFS).not.toHaveBeenCalled();
    });

    it("should call DFS even if tokens array is empty", () => {
      const token = {
        href: "https://example.com",
        tokens: [],
        title: null,
      };

      writeLink.call(mockContext, token);

      // Empty array is truthy, so DFS should be called
      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should append title in parentheses if title is provided", () => {
      const token = {
        href: "https://example.com",
        tokens: [],
        title: "Example Site",
      };

      writeLink.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith(" (Example Site)");
    });

    it("should not append title if title is not provided", () => {
      const token = {
        href: "https://example.com",
        tokens: [],
        title: null,
      };

      writeLink.call(mockContext, token);

      expect(mockContext.writeText).not.toHaveBeenCalled();
    });

    it("should create ExternalHyperlink with correct properties", () => {
      const token = {
        href: "https://example.com",
        tokens: [],
        title: null,
      };

      writeLink.call(mockContext, token);

      const addedLink = mockContext.getCurrent()[mockContext.getCurrent().length - 1];
      expect(addedLink instanceof docx.ExternalHyperlink).toBe(true);
    });

    it("should handle complex URLs", () => {
      const token = {
        href: "https://example.com/path?query=value&other=123#anchor",
        tokens: [],
        title: "Complex URL",
      };

      writeLink.call(mockContext, token);

      expect(mockContext.updateStyle).toHaveBeenCalledWith({
        link: "https://example.com/path?query=value&other=123#anchor",
        textColor: "0000EE",
      });
    });

    it("should not append empty title string", () => {
      const token = {
        href: "https://example.com",
        tokens: [],
        title: "",
      };

      writeLink.call(mockContext, token);

      // Empty string is falsy, so writeText won't be called
      expect(mockContext.writeText).not.toHaveBeenCalled();
    });

    it("should preserve existing current elements after link", () => {
      const before = new docx.TextRun({ text: "before" });
      mockContext.setCurrent([before]);

      const token = {
        href: "https://example.com",
        tokens: [],
        title: null,
      };

      writeLink.call(mockContext, token);

      expect(mockContext.getCurrent()[0]).toBe(before);
      expect(mockContext.getCurrent().length).toBeGreaterThan(1);
    });
  });
});
