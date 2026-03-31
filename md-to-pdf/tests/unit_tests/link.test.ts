const { writeLink } = require("../../helpers/link");
const { getDefaultStyle, pushStyle, popStyle } = require("../../helpers/styles");

describe("md-to-pdf link helper", () => {
  it("should set link style and traverse children", () => {
    const context = {
      style: ({ ...getDefaultStyle(), ...{ textColor: "#111111", link: null } }),
      styleStack: [],
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack(next) {
        this.styleStack = next;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      pushStyle,
      popStyle,
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
    expect(context.style.textColor).toBe("#0000EE");
    expect(context.style.link).toBe("https://example.com");
  });

  it("should fallback to token text when no child tokens", () => {
    const context = {
      style: getDefaultStyle(),
      styleStack: [],
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack(next) {
        this.styleStack = next;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      pushStyle,
      popStyle,
      DFS: jest.fn(),
      writeText: jest.fn(),
    };

    writeLink.call(context, { href: "https://example.com", text: "Link" });

    expect(context.writeText).toHaveBeenCalledWith("Link");
  });

  it("should not append title when title is missing", () => {
    const context = {
      style: getDefaultStyle(),
      styleStack: [],
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      getStyleStack() {
        return this.styleStack;
      },
      setStyleStack(next) {
        this.styleStack = next;
      },
      updateStyle(partial) {
        this.style = { ...this.style, ...partial };
      },
      pushStyle,
      popStyle,
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
