const { writeLink } = require("../../helpers/link");
const { getDefaultStyle } = require("../../helpers/style");

describe("md-to-pdf link helper", () => {
  it("should set link style, traverse children, and restore style", () => {
    const context = {
      style: getDefaultStyle({ textColor: "#111111", link: null }),
      getStyle() {
        return this.style;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      DFS: jest.fn(),
      writeText: jest.fn(),
    };

    const token = {
      href: "https://example.com",
      tokens: [{ type: "text", text: "Example" }],
      title: "Site",
    };

    writeLink.call(context, token);

    expect(context.DFS).toHaveBeenCalledWith(token.tokens);
    expect(context.writeText).toHaveBeenCalledWith(" (Site)");
    expect(context.style.textColor).toBe("#111111");
    expect(context.style.link).toBe(null);
  });

  it("should fallback to token text when no child tokens", () => {
    const context = {
      style: getDefaultStyle(),
      getStyle() {
        return this.style;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      DFS: jest.fn(),
      writeText: jest.fn(),
    };

    writeLink.call(context, { href: "https://example.com", text: "Link" });

    expect(context.writeText).toHaveBeenCalledWith("Link");
  });

  it("should not append title when title is missing", () => {
    const context = {
      style: getDefaultStyle(),
      getStyle() {
        return this.style;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      DFS: jest.fn(),
      writeText: jest.fn(),
    };

    writeLink.call(context, {
      href: "https://example.com",
      tokens: [{ type: "text", text: "x" }],
    });

    expect(context.DFS).toHaveBeenCalled();
    expect(context.writeText).not.toHaveBeenCalled();
  });
});
