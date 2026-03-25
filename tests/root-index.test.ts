jest.mock("../md-to-docx", () => {
  return jest.fn(() => ({
    convert: jest.fn(),
  }));
});

describe("root index.js", () => {
  it("should export mdToDocx from factory", () => {
    const root = require("../index");

    expect(root).toBeDefined();
    expect(root.mdToDocx).toBeDefined();
    expect(typeof root.mdToDocx.convert).toBe("function");
  });
});
