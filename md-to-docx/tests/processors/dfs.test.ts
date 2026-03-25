const { DFS } = require("../../processors/dfs");

describe("dfs.js processors", () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      processParent: jest.fn(),
      processChild: jest.fn(),
    };
  });

  describe("DFS (Depth-First Search)", () => {
    it("should process tokens array", () => {
      const tokens = [
        { type: "text", text: "hello" },
        { type: "paragraph", tokens: [] },
      ];

      DFS.call(mockContext, tokens);

      expect(mockContext.processParent).toHaveBeenCalled();
      expect(mockContext.processChild).toHaveBeenCalled();
    });

    it("should call processParent for tokens with children", () => {
      const token = { type: "paragraph", tokens: [{ type: "text" }] };
      const tokens = [token];

      DFS.call(mockContext, tokens);

      expect(mockContext.processParent).toHaveBeenCalledWith(token);
    });

    it("should call processChild for tokens without children", () => {
      const token = { type: "text", text: "hello" };
      const tokens = [token];

      DFS.call(mockContext, tokens);

      expect(mockContext.processChild).toHaveBeenCalledWith(token);
    });

    it("should handle empty tokens array", () => {
      DFS.call(mockContext, []);

      expect(mockContext.processParent).not.toHaveBeenCalled();
      expect(mockContext.processChild).not.toHaveBeenCalled();
    });

    it("should process multiple tokens in order", () => {
      const token1 = { type: "text", text: "first" };
      const token2 = { type: "paragraph", tokens: [] };
      const token3 = { type: "text", text: "last" };
      const tokens = [token1, token2, token3];

      DFS.call(mockContext, tokens);

      expect(mockContext.processChild).toHaveBeenNthCalledWith(1, token1);
      expect(mockContext.processParent).toHaveBeenNthCalledWith(1, token2);
      expect(mockContext.processChild).toHaveBeenNthCalledWith(2, token3);
    });

    it("should recognize tokens with empty tokens array as having children", () => {
      const token = { type: "paragraph", tokens: [] };
      const tokens = [token];

      DFS.call(mockContext, tokens);

      expect(mockContext.processParent).toHaveBeenCalledWith(token);
      expect(mockContext.processChild).not.toHaveBeenCalled();
    });

    it("should not process tokens with undefined tokens property", () => {
      const token = { type: "text", text: "hello" };
      const tokens = [token];

      DFS.call(mockContext, tokens);

      expect(mockContext.processChild).toHaveBeenCalledWith(token);
      expect(mockContext.processParent).not.toHaveBeenCalled();
    });

    it("should not process tokens with non-array tokens property", () => {
      const token = { type: "text", text: "hello", tokens: "not an array" };
      const tokens = [token];

      DFS.call(mockContext, tokens);

      expect(mockContext.processChild).toHaveBeenCalledWith(token);
      expect(mockContext.processParent).not.toHaveBeenCalled();
    });

    it("should handle mixed token types", () => {
      const tokens = [
        { type: "heading", tokens: ["content"] },
        { type: "br" },
        { type: "list", tokens: [] },
        { type: "code", lines: ["line1"] },
        { type: "paragraph", tokens: [] },
      ];

      DFS.call(mockContext, tokens);

      expect(mockContext.processParent).toHaveBeenCalledTimes(3);
      expect(mockContext.processChild).toHaveBeenCalledTimes(2);
    });

    it("should process deeply nested structures", () => {
      const deepToken = {
        type: "blockquote",
        tokens: [
          {
            type: "paragraph",
            tokens: [
              { type: "strong", tokens: [{ type: "text", text: "bold" }] },
            ],
          },
        ],
      };

      DFS.call(mockContext, [deepToken]);

      expect(mockContext.processParent).toHaveBeenCalledWith(deepToken);
    });

    it("should handle tokens with numeric array indices", () => {
      const tokens = [
        { type: "paragraph", tokens: [] },
        { type: "paragraph", tokens: [] },
        { type: "text", text: "item" },
      ];

      DFS.call(mockContext, tokens);

      expect(mockContext.processParent).toHaveBeenCalledTimes(2);
      expect(mockContext.processChild).toHaveBeenCalledTimes(1);
    });
  });
});
