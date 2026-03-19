const { processParent } = require("../../processors/parent");

describe("parent.js processors", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      pushStyle: jest.fn(),
      popStyle: jest.fn(),
      DFS: jest.fn(),
      setTextStyle: jest.fn(),
      writeBlockquote: jest.fn(),
      writeHeading: jest.fn(),
      writeLink: jest.fn(),
      writeListItem: jest.fn(),
      groupParagraph: jest.fn(),
    };
  });

  describe("processParent", () => {
    it("should push and pop style", () => {
      const token = { type: "blockquote", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.pushStyle).toHaveBeenCalled();
      expect(mockContext.popStyle).toHaveBeenCalled();
    });

    it("should handle blockquote type", () => {
      const token = { type: "blockquote", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.writeBlockquote).toHaveBeenCalledWith(token);
    });

    it("should handle del (strikethrough) type", () => {
      const token = { type: "del", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.setTextStyle).toHaveBeenCalledWith("del");
      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should handle em (emphasis) type", () => {
      const token = { type: "em", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.setTextStyle).toHaveBeenCalledWith("em");
      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should handle heading type", () => {
      const token = { type: "heading", depth: 1, tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.writeHeading).toHaveBeenCalledWith(token);
    });

    it("should handle image type as link", () => {
      const token = { type: "image", href: "image.png", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.writeLink).toHaveBeenCalledWith(token);
    });

    it("should handle link type", () => {
      const token = { type: "link", href: "https://example.com", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.writeLink).toHaveBeenCalledWith(token);
    });

    it("should handle list_item type", () => {
      const token = { type: "list_item", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.writeListItem).toHaveBeenCalledWith(token);
    });

    it("should handle paragraph type", () => {
      const nestedTokens = [{ type: "text", text: "content" }];
      const token = { type: "paragraph", tokens: nestedTokens };
      processParent.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
      expect(mockContext.groupParagraph).toHaveBeenCalled();
    });

    it("should handle strong type", () => {
      const token = { type: "strong", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.setTextStyle).toHaveBeenCalledWith("strong");
      expect(mockContext.DFS).toHaveBeenCalledWith([]);
    });

    it("should handle text type", () => {
      const nestedTokens = [{ type: "text", text: "hello" }];
      const token = { type: "text", tokens: nestedTokens };
      processParent.call(mockContext, token);

      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
    });

    it("should ignore unknown types", () => {
      const token = { type: "unknown_type", tokens: [] };
      processParent.call(mockContext, token);

      expect(mockContext.DFS).not.toHaveBeenCalled();
      expect(mockContext.writeHeading).not.toHaveBeenCalled();
    });

    it("should process del with nested tokens", () => {
      const nestedTokens = [
        { type: "text", text: "crossed out" },
      ];
      const token = { type: "del", tokens: nestedTokens };
      processParent.call(mockContext, token);

      expect(mockContext.setTextStyle).toHaveBeenCalledWith("del");
      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
    });

    it("should process em with nested tokens", () => {
      const nestedTokens = [
        { type: "text", text: "emphasized" },
      ];
      const token = { type: "em", tokens: nestedTokens };
      processParent.call(mockContext, token);

      expect(mockContext.setTextStyle).toHaveBeenCalledWith("em");
      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
    });

    it("should process strong with nested tokens", () => {
      const nestedTokens = [
        { type: "text", text: "bold" },
      ];
      const token = { type: "strong", tokens: nestedTokens };
      processParent.call(mockContext, token);

      expect(mockContext.setTextStyle).toHaveBeenCalledWith("strong");
      expect(mockContext.DFS).toHaveBeenCalledWith(nestedTokens);
    });

    it("should maintain style stack order", () => {
      const token = { type: "paragraph", tokens: [] };
      const callOrder = [];

      mockContext.pushStyle.mockImplementation(() => {
        callOrder.push("push");
      });
      mockContext.popStyle.mockImplementation(() => {
        callOrder.push("pop");
      });

      processParent.call(mockContext, token);

      expect(callOrder).toEqual(["push", "pop"]);
    });

    it("should handle link with title", () => {
      const token = {
        type: "link",
        href: "https://example.com",
        title: "Example",
        tokens: [],
      };
      processParent.call(mockContext, token);

      expect(mockContext.writeLink).toHaveBeenCalledWith(token);
    });

    it("should handle heading with various depths", () => {
      const depths = [1, 2, 3, 4, 5, 6];

      depths.forEach((depth) => {
        mockContext.writeHeading.mockClear();
        const token = { type: "heading", depth, tokens: [] };
        processParent.call(mockContext, token);

        expect(mockContext.writeHeading).toHaveBeenCalledWith(token);
      });
    });
  });
});
