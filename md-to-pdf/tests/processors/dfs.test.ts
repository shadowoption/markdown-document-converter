const { DFS } = require("../../processors/dfs");

describe("md-to-pdf processors DFS", () => {
  let context;

  beforeEach(() => {
    context = {
      processParent: jest.fn(),
      processChild: jest.fn(),
    };
  });

  it("should call processParent for tokens with children", () => {
    const token = { type: "paragraph", tokens: [] };

    DFS.call(context, [token]);

    expect(context.processParent).toHaveBeenCalledWith(token);
    expect(context.processChild).not.toHaveBeenCalled();
  });

  it("should call processChild for tokens without children", () => {
    const token = { type: "text", text: "hello" };

    DFS.call(context, [token]);

    expect(context.processChild).toHaveBeenCalledWith(token);
    expect(context.processParent).not.toHaveBeenCalled();
  });

  it("should process mixed tokens in order", () => {
    const t1 = { type: "text", text: "a" };
    const t2 = { type: "paragraph", tokens: [] };
    const t3 = { type: "code", text: "x" };

    DFS.call(context, [t1, t2, t3]);

    expect(context.processChild).toHaveBeenNthCalledWith(1, t1);
    expect(context.processParent).toHaveBeenNthCalledWith(1, t2);
    expect(context.processChild).toHaveBeenNthCalledWith(2, t3);
  });

  it("should handle empty token list", () => {
    DFS.call(context, []);

    expect(context.processParent).not.toHaveBeenCalled();
    expect(context.processChild).not.toHaveBeenCalled();
  });
});
