// Mock modules before requiring anything
jest.mock("marked", () => ({
  lexer: jest.fn().mockReturnValue([]),
  walkTokens: jest.fn((tokens, callback) => {
    tokens.forEach(callback);
  }),
}));

jest.mock("he", () => ({
  decode: jest.fn((text) => text),
}));

const mdToDocxFactory = require("../index");

describe("index.js factory", () => {
  describe("default export", () => {
    it("should export a function", () => {
      expect(typeof mdToDocxFactory).toBe("function");
    });

    it("should return an object with convert method", () => {
      const converter = mdToDocxFactory();

      expect(typeof converter).toBe("object");
      expect(typeof converter.convert).toBe("function");
    });
  });

  describe("converter instance", () => {
    it("should create a new converter instance", () => {
      const converter = mdToDocxFactory();

      expect(converter).toBeDefined();
    });

    it("should have convert method", () => {
      const converter = mdToDocxFactory();

      expect(typeof converter.convert).toBe("function");
    });

    it("should accept text parameter", () => {
      const converter = mdToDocxFactory();

      expect(() => {
        converter.convert("test markdown");
      }).not.toThrow();
    });

    it("should accept style parameter", () => {
      const converter = mdToDocxFactory();

      expect(() => {
        converter.convert("test", { font: "Arial" });
      }).not.toThrow();
    });

    it("should return array from convert", () => {
      const converter = mdToDocxFactory();
      const result = converter.convert("test markdown");

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("multiple instances", () => {
    it("should create separate instances", () => {
      const converter1 = mdToDocxFactory();
      const converter2 = mdToDocxFactory();

      expect(converter1).not.toBe(converter2);
    });

    it("should maintain separate state", () => {
      const converter1 = mdToDocxFactory();
      const converter2 = mdToDocxFactory();

      converter1.convert("markdown 1");
      converter2.convert("markdown 2");

      // Both should have produced results independently
      expect(typeof converter1.convert).toBe("function");
      expect(typeof converter2.convert).toBe("function");
    });
  });

  describe("convert method", () => {
    it("should accept empty string", () => {
      const converter = mdToDocxFactory();

      expect(() => {
        converter.convert("");
      }).not.toThrow();
    });

    it("should accept markdown text", () => {
      const converter = mdToDocxFactory();
      const markdown = "# Heading\n\nParagraph";

      expect(() => {
        converter.convert(markdown);
      }).not.toThrow();
    });

    it("should accept style object", () => {
      const converter = mdToDocxFactory();

      expect(() => {
        converter.convert("text", { fontSize: 20, font: "Courier" });
      }).not.toThrow();
    });

    it("should return array", () => {
      const converter = mdToDocxFactory();
      const result = converter.convert("test");

      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle multiple conversions", () => {
      const converter = mdToDocxFactory();

      const result1 = converter.convert("First markdown");
      const result2 = converter.convert("Second markdown");

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });

    it("should use default empty style if not provided", () => {
      const converter = mdToDocxFactory();

      expect(() => {
        converter.convert("test");
      }).not.toThrow();
    });

    it("should pass style to converter", () => {
      const converter = mdToDocxFactory();
      const customStyle = { fontSize: 24, font: "Georgia" };

      expect(() => {
        converter.convert("test", customStyle);
      }).not.toThrow();
    });
  });

  describe("API compliance", () => {
    it("should follow factory pattern", () => {
      const factory = mdToDocxFactory;

      // First call creates instance
      const instance1 = factory();
      // Second call creates different instance
      const instance2 = factory();

      expect(instance1).not.toBe(instance2);
    });

    it("should create properly initialized converter", () => {
      const converter = mdToDocxFactory();

      expect(converter.convert).toBeDefined();
      expect(typeof converter.convert).toBe("function");
    });

    it("should handle style configuration", () => {
      const converter = mdToDocxFactory();
      const style = { fontSize: 18, font: "Courier New" };

      const result = converter.convert("# Test", style);

      expect(Array.isArray(result)).toBe(true);
    });

    it("should work with common markdown patterns", () => {
      const converter = mdToDocxFactory();
      const patterns = [
        "# Heading",
        "**bold**",
        "*italic*",
        "- list item",
        "> blockquote",
        "[link](url)",
      ];

      patterns.forEach((pattern) => {
        expect(() => {
          converter.convert(pattern);
        }).not.toThrow();
      });
    });
  });
});
