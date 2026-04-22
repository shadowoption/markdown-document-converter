jest.mock("jspdf-autotable", () => ({
  autoTable: jest.fn((doc, options) => {
    options.didDrawPage({ cursor: { y: options.startY + 50 } });
  }),
}));

const { processTable } = require("../../helpers/table");
const { getDefaultStyle } = require("../../helpers/styles");
const { createMockDoc } = require("../test-utils/mockDoc");
const { autoTable } = require("jspdf-autotable");

describe("md-to-pdf table helper", () => {
  it("should process table and increase currentHeight without extra pre-break at line start", () => {
    const doc = createMockDoc();
    const context = {
      style: ({ ...getDefaultStyle(), ...{ currentHeight: 70, lineDistance: 10, currentWidth: 60, maxLineWidth: 500 } }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      lineBreak: jest.fn(function(distance) {
        this.style = {
          ...this.style,
          currentHeight: this.style.currentHeight + distance,
          cursorIndex: this.style.currentWidth,
        };
      }),
    };

    const before = context.style.currentHeight;

    processTable.call(context, {
      header: [{ text: "A" }, { text: "B" }],
      align: ["left", "right"],
      rows: [[{ text: "1" }, { text: "2" }]],
    });

    expect(context.style.currentHeight).toBeGreaterThan(before);
    expect(context.lineBreak).toHaveBeenCalledTimes(1);
    expect(context.lineBreak).toHaveBeenCalledWith(10);
    expect(autoTable).toHaveBeenCalledWith(
      doc,
      expect.objectContaining({
        pageBreak: "auto",
      })
    );
  });

  it("should pre-break when table starts mid-line", () => {
    const doc = createMockDoc();
    const context = {
      style: ({
        ...getDefaultStyle(),
        ...{ currentHeight: 70, lineDistance: 10, currentWidth: 60, cursorIndex: 90, maxLineWidth: 500 },
      }),
      getDoc() {
        return doc;
      },
      getStyle() {
        return this.style;
      },
      setStyle(next) {
        this.style = next;
      },
      lineBreak: jest.fn(function(distance) {
        this.style = {
          ...this.style,
          currentHeight: this.style.currentHeight + distance,
          cursorIndex: this.style.currentWidth,
        };
      }),
    };

    processTable.call(context, {
      header: [{ text: "A" }, { text: "B" }],
      align: ["left", "right"],
      rows: [[{ text: "1" }, { text: "2" }]],
    });

    expect(context.lineBreak).toHaveBeenCalledTimes(2);
    expect(context.lineBreak).toHaveBeenNthCalledWith(1, 10);
    expect(context.lineBreak).toHaveBeenNthCalledWith(2, 10);
  });
});
