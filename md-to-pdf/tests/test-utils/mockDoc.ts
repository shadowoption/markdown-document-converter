function createMockDoc(overrides = {}) {
  const doc = {
    addPage: jest.fn(),
    line: jest.fn(),
    rect: jest.fn(),
    text: jest.fn(),
    textWithLink: jest.fn(),
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setDrawColor: jest.fn(),
    splitTextToSize: jest.fn((text) => [String(text)]),
    getTextWidth: jest.fn((text) => String(text).length * 5),
    ...overrides,
  };

  return doc;
}

module.exports = {
  createMockDoc,
};
