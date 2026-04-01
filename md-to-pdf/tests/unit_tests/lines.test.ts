const { breakLine, lineBreak, horizontalLine } = require("../../helpers/lines");
const { getDefaultStyle } = require("../../helpers/styles");
const { createMockDoc } = require("../test-utils/mockDoc");

describe("md-to-pdf lines helpers", () => {
  it("breakLine should increase currentHeight and reset cursorIndex", () => {
    const doc = createMockDoc();
    const style = ({ ...getDefaultStyle(), ...{ currentHeight: 100, currentWidth: 60, cursorIndex: 90 } });

    const next = breakLine(doc, 15, style);

    expect(next.currentHeight).toBe(115);
    expect(next.cursorIndex).toBe(60);
  });

  it("lineBreak should persist style update into context", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 100 } }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
    };

    lineBreak.call(context, 20);

    expect(context.style.currentHeight).toBe(120);
  });

  it("horizontalLine should draw line and increase currentHeight twice", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, lineSpc: 12 } }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      lineBreak(distance) {
        lineBreak.call(this, distance);
      },
    };

    horizontalLine.call(context);

    expect(doc.line).toHaveBeenCalled();
    expect(context.style.currentHeight).toBe(94);
  });

  it("should move to startHeight when page overflows", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 780, lineSpc: 20, pageHeight: 790, startHeight: 70 } }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
    };

    lineBreak.call(context, 20);

    expect(doc.addPage).toHaveBeenCalled();
    expect(context.style.currentHeight).toBe(70);
  });
});
