const { processChild } = require("../../processors/child");

describe("child.js processors", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pushStyle: jest.fn(),
      popStyle: jest.fn(),
      breakLine: jest.fn(),
      groupParagraph: jest.fn(),
      horizontalLine: jest.fn(),
      writeText: jest.fn(),
      writeCheckBox: jest.fn(),
      writeCode: jest.fn(),
      writeCodeSpan: jest.fn(),
      writeLink: jest.fn(),
      writeList: jest.fn(),
      processTable: jest.fn(),
    };
  });

  describe("processChild", () => {
    it("should push and pop style", () => {
      const token = { type: "br" };
      processChild.call(mockContext, token);

      expect(mockContext.pushStyle).toHaveBeenCalled();
      expect(mockContext.popStyle).toHaveBeenCalled();
    });

    it("should handle br (line break) type", () => {
      const token = { type: "br" };
      processChild.call(mockContext, token);

      expect(mockContext.breakLine).toHaveBeenCalled();
    });

    it("should handle checkbox type", () => {
      const token = { type: "checkbox", checked: true };
      processChild.call(mockContext, token);

      expect(mockContext.writeCheckBox).toHaveBeenCalledWith(token);
    });

    it("should handle code type", () => {
      const token = { type: "code", lines: ["line1", "line2"] };
      processChild.call(mockContext, token);

      expect(mockContext.writeCode).toHaveBeenCalledWith(token);
    });

    it("should handle codespan type", () => {
      const token = { type: "codespan", text: "code" };
      processChild.call(mockContext, token);

      expect(mockContext.writeCodeSpan).toHaveBeenCalledWith(token);
    });

    it("should handle def (definition) type - unused", () => {
      const token = { type: "def" };
      processChild.call(mockContext, token);

      expect(mockContext.writeText).not.toHaveBeenCalled();
    });

    it("should handle hr (horizontal rule) type", () => {
      const token = { type: "hr" };
      processChild.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalled();
      expect(mockContext.horizontalLine).toHaveBeenCalled();
      expect(mockContext.breakLine).toHaveBeenCalled();
    });

    it("should handle html type - not currently supported", () => {
      const token = { type: "html", text: "<div>content</div>" };
      processChild.call(mockContext, token);

      expect(mockContext.writeText).not.toHaveBeenCalled();
    });

    it("should handle image type as link", () => {
      const token = { type: "image", href: "image.png" };
      processChild.call(mockContext, token);

      expect(mockContext.writeLink).toHaveBeenCalledWith(token);
    });

    it("should handle list type", () => {
      const token = { type: "list", items: [] };
      processChild.call(mockContext, token);

      expect(mockContext.writeList).toHaveBeenCalledWith(token);
    });

    it("should handle space type", () => {
      const token = { type: "space" };
      processChild.call(mockContext, token);

      expect(mockContext.breakLine).toHaveBeenCalled();
    });

    it("should handle table type", () => {
      const token = { type: "table", header: [], rows: [] };
      processChild.call(mockContext, token);

      expect(mockContext.groupParagraph).toHaveBeenCalled();
      expect(mockContext.processTable).toHaveBeenCalledWith(token);
      expect(mockContext.breakLine).toHaveBeenCalled();
    });

    it("should handle escape type - fallback to text", () => {
      const token = { type: "escape", text: "escaped_text" };
      processChild.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith("escaped_text");
    });

    it("should handle unknown type as text fallback", () => {
      const token = { type: "unknown", text: "fallback_text" };
      processChild.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith("fallback_text");
    });

    it("should handle hr with all required calls in correct order", () => {
      const token = { type: "hr" };
      const callOrder = [];

      mockContext.groupParagraph.mockImplementation(() => {
        callOrder.push("groupParagraph");
      });
      mockContext.horizontalLine.mockImplementation(() => {
        callOrder.push("horizontalLine");
      });
      mockContext.breakLine.mockImplementation(() => {
        callOrder.push("breakLine");
      });

      processChild.call(mockContext, token);

      expect(callOrder).toEqual(["groupParagraph", "horizontalLine", "breakLine"]);
    });

    it("should handle table with all required calls in correct order", () => {
      const token = { type: "table", header: [], rows: [] };
      const callOrder = [];

      mockContext.groupParagraph.mockImplementation(() => {
        callOrder.push("groupParagraph");
      });
      mockContext.processTable.mockImplementation(() => {
        callOrder.push("processTable");
      });
      mockContext.breakLine.mockImplementation(() => {
        callOrder.push("breakLine");
      });

      processChild.call(mockContext, token);

      expect(callOrder).toEqual(["groupParagraph", "processTable", "breakLine"]);
    });

    it("should handle checkbox with various states", () => {
      const checkedToken = { type: "checkbox", checked: true };
      const uncheckedToken = { type: "checkbox", checked: false };

      processChild.call(mockContext, checkedToken);
      processChild.call(mockContext, uncheckedToken);

      expect(mockContext.writeCheckBox).toHaveBeenNthCalledWith(1, checkedToken);
      expect(mockContext.writeCheckBox).toHaveBeenNthCalledWith(2, uncheckedToken);
    });

    it("should handle code with multiple lines", () => {
      const token = {
        type: "code",
        lines: ["line1", "line2", "line3"],
      };
      processChild.call(mockContext, token);

      expect(mockContext.writeCode).toHaveBeenCalledWith(token);
    });

    it("should maintain style stack order", () => {
      const token = { type: "br" };
      const callOrder = [];

      mockContext.pushStyle.mockImplementation(() => {
        callOrder.push("push");
      });
      mockContext.popStyle.mockImplementation(() => {
        callOrder.push("pop");
      });

      processChild.call(mockContext, token);

      expect(callOrder).toEqual(["push", "pop"]);
    });

    it("should handle text with special characters", () => {
      const token = { type: "escape", text: "<script>alert('xss')</script>" };
      processChild.call(mockContext, token);

      expect(mockContext.writeText).toHaveBeenCalledWith("<script>alert('xss')</script>");
    });

    it("should handle codespan with code examples", () => {
      const tokens = [
        { type: "codespan", text: "const x = 5;" },
        { type: "codespan", text: "console.log()" },
      ];

      tokens.forEach((token) => {
        mockContext.writeCodeSpan.mockClear();
        processChild.call(mockContext, token);
        expect(mockContext.writeCodeSpan).toHaveBeenCalledWith(token);
      });
    });

    it("should handle link as image", () => {
      const token = { type: "image", href: "https://example.com", alt: "alt text" };
      processChild.call(mockContext, token);

      expect(mockContext.writeLink).toHaveBeenCalledWith(token);
    });
  });
});
