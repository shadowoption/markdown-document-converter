const { processChild } = require("../../processors/child");

describe("md-to-pdf child processor", () => {
  let context;

  beforeEach(() => {
    context = {
      pushStyle: jest.fn(),
      popStyle: jest.fn(),
      lineBreak: jest.fn(),
      writeCheckBox: jest.fn(),
      writeCode: jest.fn(),
      writeCodeSpan: jest.fn(),
      writeHtml: jest.fn(),
      horizontalLine: jest.fn(),
      writeLink: jest.fn(),
      writeList: jest.fn(),
      processTable: jest.fn(),
      writeText: jest.fn(),
      getStyle: jest.fn(() => ({ lineDistance: 10 })),
      getSpaceBreakCount: jest.fn(() => 1),
    };
  });

  it("should push and pop style", () => {
    processChild.call(context, { type: "br" });

    expect(context.pushStyle).toHaveBeenCalled();
    expect(context.popStyle).toHaveBeenCalled();
  });

  it("should break line for br and space", () => {
    processChild.call(context, { type: "br" });
    processChild.call(context, { type: "space" });

    expect(context.lineBreak).toHaveBeenCalledTimes(2);
    expect(context.lineBreak).toHaveBeenCalledWith(10);
    expect(context.getSpaceBreakCount).toHaveBeenCalledWith({ type: "space" });
  });

  it("should break multiple lines for space based on newline count", () => {
    context.getSpaceBreakCount.mockReturnValue(3);

    processChild.call(context, { type: "space", raw: "\n\n\n" });

    expect(context.lineBreak).toHaveBeenCalledTimes(3);
    expect(context.lineBreak).toHaveBeenNthCalledWith(1, 10);
    expect(context.lineBreak).toHaveBeenNthCalledWith(2, 10);
    expect(context.lineBreak).toHaveBeenNthCalledWith(3, 10);
  });

  it("should route to dedicated handlers", () => {
    const code = { type: "code", lines: ["x"] };
    const span = { type: "codespan", text: "x" };
    const image = { type: "image", href: "https://example.com" };
    const list = { type: "list", items: [] };
    const table = { type: "table", header: [], rows: [], align: [] };

    processChild.call(context, { type: "checkbox", checked: true });
    processChild.call(context, code);
    processChild.call(context, span);
    processChild.call(context, { type: "hr" });
    processChild.call(context, image);
    processChild.call(context, list);
    processChild.call(context, table);

    expect(context.writeCheckBox).toHaveBeenCalled();
    expect(context.writeCode).toHaveBeenCalledWith(code);
    expect(context.writeCodeSpan).toHaveBeenCalledWith(span);
    expect(context.horizontalLine).toHaveBeenCalled();
    expect(context.writeLink).toHaveBeenCalledWith(image);
    expect(context.writeList).toHaveBeenCalledWith(list);
    expect(context.processTable).toHaveBeenCalledWith(table);
  });

  it("should write fallback text", () => {
    processChild.call(context, { type: "escape", text: "hello" });

    expect(context.writeText).toHaveBeenCalledWith("hello");
  });

  it("should render html tokens as literal text", () => {
    processChild.call(context, { type: "html", raw: "<div class=\"note\">x</div>" });

    expect(context.writeHtml).toHaveBeenCalledWith({ type: "html", raw: "<div class=\"note\">x</div>" });
  });

  it("should preserve blank line after block html with trailing newlines", () => {
    processChild.call(context, { type: "html", block: true, raw: "<div>x</div>\n\n" });

    expect(context.writeHtml).toHaveBeenCalledWith({ type: "html", block: true, raw: "<div>x</div>\n\n" });
  });
});
