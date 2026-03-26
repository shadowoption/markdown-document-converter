const { processParent } = require("../../processors/parent");

describe("md-to-pdf parent processor", () => {
  let context;

  beforeEach(() => {
    context = {
      pushStyle: jest.fn(),
      popStyle: jest.fn(),
      DFS: jest.fn(),
      setTextStyle: jest.fn(),
      writeBlockquote: jest.fn(),
      writeHeading: jest.fn(),
      writeLink: jest.fn(),
      writeListItem: jest.fn(),
      lineBreak: jest.fn(),
      updateStyle: jest.fn(),
      getStyle: jest.fn(() => ({ lineDistance: 10, skipParagraphBreak: false })),
    };
  });

  it("should push and pop style", () => {
    processParent.call(context, { type: "text", tokens: [] });

    expect(context.pushStyle).toHaveBeenCalled();
    expect(context.popStyle).toHaveBeenCalled();
  });

  it("should handle heading", () => {
    const token = { type: "heading", depth: 2, tokens: [] };

    processParent.call(context, token);

    expect(context.writeHeading).toHaveBeenCalledWith(token);
  });

  it("should handle paragraph with line break", () => {
    const token = { type: "paragraph", tokens: [{ type: "text", text: "hello" }] };

    processParent.call(context, token);

    expect(context.lineBreak).toHaveBeenCalledWith(10);
    expect(context.DFS).toHaveBeenCalledWith(token.tokens);
  });

  it("should skip paragraph break when skipParagraphBreak is true", () => {
    context.getStyle.mockReturnValue({ lineDistance: 10, skipParagraphBreak: true });
    const token = { type: "paragraph", tokens: [] };

    processParent.call(context, token);

    expect(context.updateStyle).toHaveBeenCalledWith({ skipParagraphBreak: false });
    expect(context.lineBreak).not.toHaveBeenCalled();
  });

  it("should set strong/em/del style and traverse", () => {
    processParent.call(context, { type: "strong", tokens: [] });
    processParent.call(context, { type: "em", tokens: [] });
    processParent.call(context, { type: "del", tokens: [] });

    expect(context.setTextStyle).toHaveBeenCalledWith("strong");
    expect(context.setTextStyle).toHaveBeenCalledWith("em");
    expect(context.setTextStyle).toHaveBeenCalledWith("del");
  });

  it("should route blockquote, link/image, list_item, and text tokens", () => {
    const blockquote = { type: "blockquote", tokens: [] };
    const link = { type: "link", href: "https://example.com", tokens: [] };
    const image = { type: "image", href: "https://example.com/i.png", tokens: [] };
    const listItem = { type: "list_item", tokens: [] };
    const text = { type: "text", tokens: [] };

    processParent.call(context, blockquote);
    processParent.call(context, link);
    processParent.call(context, image);
    processParent.call(context, listItem);
    processParent.call(context, text);

    expect(context.writeBlockquote).toHaveBeenCalledWith(blockquote);
    expect(context.writeLink).toHaveBeenCalledWith(link);
    expect(context.writeLink).toHaveBeenCalledWith(image);
    expect(context.writeListItem).toHaveBeenCalledWith(listItem);
    expect(context.DFS).toHaveBeenCalledWith([]);
  });

  it("should ignore unknown token types", () => {
    processParent.call(context, { type: "unknown_type", tokens: [] });

    expect(context.writeHeading).not.toHaveBeenCalled();
    expect(context.writeLink).not.toHaveBeenCalled();
    expect(context.writeListItem).not.toHaveBeenCalled();
  });
});
