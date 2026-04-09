jest.mock("../md-to-docx", () => {
  return jest.fn(() => ({
    convert: jest.fn(),
  }));
});

jest.mock("../md-to-pdf", () => {
  return jest.fn(() => ({
    convert: jest.fn(),
  }));
});

describe("root index.js", () => {
  it("should export mdToDocx and mdToPdf from factories", () => {
    const root = require("../index");

    expect(root).toBeDefined();
    expect(root.mdToDocx).toBeDefined();
    expect(typeof root.mdToDocx.convert).toBe("function");
    expect(root.mdToPdf).toBeDefined();
    expect(typeof root.mdToPdf.convert).toBe("function");
  });
});
