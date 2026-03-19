const { processTable } = require("../../helpers/table");
const docx = require("docx");

describe("table.js helpers", () => {
  let mockContext;
  let tableSpy;
  let tableRowSpy;
  let tableCellSpy;
  let paragraphSpy;
  let textRunSpy;

  beforeEach(() => {
    mockContext = {
      paragraphs: [],
      style: {
        fontSize: 22,
        font: "Arial",
        textColor: "333333",
      },
    };

    // Mock docx constructors
    tableSpy = jest.spyOn(docx, "Table").mockImplementation(function(options) {
      this.rows = options?.rows || [];
      this.width = options?.width;
    });

    tableRowSpy = jest.spyOn(docx, "TableRow").mockImplementation(function(options) {
      this.children = options?.children || [];
      this.tableHeader = options?.tableHeader;
    });

    tableCellSpy = jest.spyOn(docx, "TableCell").mockImplementation(function(options) {
      this.children = options?.children || [];
      this.margins = options?.margins;
    });

    paragraphSpy = jest.spyOn(docx, "Paragraph").mockImplementation(function(options) {
      this.children = options?.children || [];
      this.alignment = options?.alignment;
    });

    textRunSpy = jest.spyOn(docx, "TextRun").mockImplementation(function(options) {
      this.text = options?.text;
      this.bold = options?.bold;
      this.size = options?.size;
      this.font = options?.font;
      this.color = options?.color;
    });
  });

  afterEach(() => {
    tableSpy.mockRestore();
    tableRowSpy.mockRestore();
    tableCellSpy.mockRestore();
    paragraphSpy.mockRestore();
    textRunSpy.mockRestore();
  });

  describe("processTable", () => {
    it("should create a table with headers", () => {
      const token = {
        header: [
          { text: "Header 1" },
          { text: "Header 2" },
          { text: "Header 3" },
        ],
        align: [undefined, undefined, undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      expect(mockContext.paragraphs.length).toBe(1);
      expect(mockContext.paragraphs[0] instanceof docx.Table).toBe(true);
    });

    it("should add header row with correct number of cells", () => {
      const token = {
        header: [
          { text: "Col1" },
          { text: "Col2" },
          { text: "Col3" },
        ],
        align: [undefined, undefined, undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      expect(table.rows[0].children.length).toBe(3);
    });

    it("should mark header row as table header", () => {
      const token = {
        header: [{ text: "Header" }],
        align: [undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      expect(table.rows[0].tableHeader).toBe(true);
    });

    it("should add data rows to table", () => {
      const token = {
        header: [
          { text: "Col1" },
          { text: "Col2" },
        ],
        align: [undefined, undefined],
        rows: [
          [{ text: "Data1" }, { text: "Data2" }],
          [{ text: "Data3" }, { text: "Data4" }],
        ],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      expect(table.rows.length).toBe(3);
      expect(table.rows[1].tableHeader).toBeUndefined();
      expect(table.rows[2].tableHeader).toBeUndefined();
    });

    it("should apply left alignment when specified", () => {
      const token = {
        header: [{ text: "Header" }],
        align: ["left"],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      expect(headerCell.children[0].alignment).toBe(docx.AlignmentType.LEFT);
    });

    it("should apply right alignment when specified", () => {
      const token = {
        header: [{ text: "Header" }],
        align: ["right"],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      expect(headerCell.children[0].alignment).toBe(docx.AlignmentType.RIGHT);
    });

    it("should apply center alignment when specified", () => {
      const token = {
        header: [{ text: "Header" }],
        align: ["center"],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      expect(headerCell.children[0].alignment).toBe(docx.AlignmentType.CENTER);
    });

    it("should not apply alignment when not specified", () => {
      const token = {
        header: [{ text: "Header" }],
        align: [undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      expect(headerCell.children[0].alignment).toBeUndefined();
    });

    it("should make header cells bold", () => {
      const token = {
        header: [{ text: "Header" }],
        align: [undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      const textRun = headerCell.children[0].children[0];
      expect(textRun.bold).toBe(true);
    });

    it("should not make data cells bold", () => {
      const token = {
        header: [{ text: "Header" }],
        align: [undefined],
        rows: [[{ text: "Data" }]],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const dataCell = table.rows[1].children[0];
      const textRun = dataCell.children[0].children[0];
      expect(textRun.bold).toBe(false);
    });

    it("should set table width to 100 percent", () => {
      const token = {
        header: [{ text: "Header" }],
        align: [undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      expect(table.width.size).toBe(100);
      expect(table.width.type).toBe(docx.WidthType.PERCENTAGE);
    });

    it("should decode HTML entities in cell text", () => {
      const token = {
        header: [{ text: "&lt;script&gt;" }],
        align: [undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      const textRun = headerCell.children[0].children[0];
      expect(textRun.text).toBe("<script>");
    });

    it("should handle missing cells in rows", () => {
      const token = {
        header: [
          { text: "Col1" },
          { text: "Col2" },
          { text: "Col3" },
        ],
        align: [undefined, undefined, undefined],
        rows: [
          [{ text: "Data1" }],
        ],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const dataRow = table.rows[1];
      expect(dataRow.children.length).toBe(3);
      expect(dataRow.children[1].children[0].children[0].text).toBe("");
      expect(dataRow.children[2].children[0].children[0].text).toBe("");
    });

    it("should apply font and color to all cells", () => {
      mockContext.style.fontSize = 20;
      mockContext.style.font = "Courier";
      mockContext.style.textColor = "FF0000";

      const token = {
        header: [{ text: "Header" }],
        align: [undefined],
        rows: [[{ text: "Data" }]],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      const headerTextRun = headerCell.children[0].children[0];

      expect(headerTextRun.font).toBe("Courier");
      expect(headerTextRun.color).toBe("FF0000");
      expect(headerTextRun.size).toBe(20);
    });

    it("should handle empty header text", () => {
      const token = {
        header: [{ text: "" }],
        align: [undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const headerCell = table.rows[0].children[0];
      const textRun = headerCell.children[0].children[0];
      expect(textRun.text).toBe("");
    });

    it("should set cell margins correctly", () => {
      const token = {
        header: [{ text: "Header" }],
        align: [undefined],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      const cell = table.rows[0].children[0];
      expect(cell.margins).toEqual({ top: 100, bottom: 100, left: 100, right: 100 });
    });

    it("should handle table with mixed alignments", () => {
      const token = {
        header: [
          { text: "Left" },
          { text: "Center" },
          { text: "Right" },
        ],
        align: ["left", "center", "right"],
        rows: [],
      };

      processTable.call(mockContext, token);

      const table = mockContext.paragraphs[0];
      expect(table.rows[0].children[0].children[0].alignment).toBe(docx.AlignmentType.LEFT);
      expect(table.rows[0].children[1].children[0].alignment).toBe(docx.AlignmentType.CENTER);
      expect(table.rows[0].children[2].children[0].alignment).toBe(docx.AlignmentType.RIGHT);
    });
  });
});
