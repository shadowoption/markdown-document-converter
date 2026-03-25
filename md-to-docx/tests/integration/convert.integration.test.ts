const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const JSZip = require("jszip");
const { Document, Packer } = require("docx");

jest.mock("marked", () => {
  const buildIntegrationTokens = () => [
    {
      type: "heading",
      depth: 1,
      tokens: [{ type: "text", text: "Report Title" }],
    },
    {
      type: "paragraph",
      tokens: [
        { type: "text", text: "This is " },
        { type: "strong", tokens: [{ type: "text", text: "bold" }] },
        { type: "text", text: ", " },
        { type: "em", tokens: [{ type: "text", text: "italic" }] },
        { type: "text", text: ", and " },
        { type: "del", tokens: [{ type: "text", text: "strike" }] },
        { type: "text", text: " text." },
      ],
    },
    {
      type: "list",
      ordered: false,
      start: 1,
      items: [
        { type: "list_item", loose: false, task: false, tokens: [{ type: "text", text: "Item one" }] },
        { type: "list_item", loose: false, task: false, tokens: [{ type: "text", text: "Item two" }] },
      ],
    },
    {
      type: "paragraph",
      tokens: [
        {
          type: "link",
          href: "https://example.com",
          title: null,
          tokens: [{ type: "text", text: "Example link" }],
        },
      ],
    },
    {
      type: "table",
      header: [{ text: "Col A" }, { text: "Col B" }],
      align: ["left", "right"],
      rows: [[{ text: "A1" }, { text: "B1" }]],
    },
    {
      type: "code",
      text: "const x = 1;",
      codeBlockStyle: false,
    },
  ];

  const buildNestedStressTokens = () => [
    {
      type: "list",
      ordered: false,
      start: 1,
      items: [
        {
          type: "list_item",
          loose: false,
          task: false,
          tokens: [
            { type: "text", text: "Top item" },
            {
              type: "blockquote",
              tokens: [
                {
                  type: "paragraph",
                  tokens: [{ type: "text", text: "Quoted line" }],
                },
                {
                  type: "code",
                  text: "nested_code()",
                  codeBlockStyle: true,
                },
                {
                  type: "list",
                  ordered: false,
                  start: 1,
                  items: [
                    {
                      type: "list_item",
                      loose: false,
                      task: false,
                      tokens: [{ type: "text", text: "Nested bullet" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return {
    lexer: jest.fn((markdownText) => {
      if (markdownText.includes("Report Title")) {
        return buildIntegrationTokens();
      }

      if (markdownText.includes("Nested Stress Test")) {
        return buildNestedStressTokens();
      }

      return [
        {
          type: "paragraph",
          tokens: [{ type: "text", text: markdownText }],
        },
      ];
    }),
    walkTokens: jest.fn((tokens, callback) => {
      const visit = (token) => {
        callback(token);

        if (Array.isArray(token.items)) {
          token.items.forEach(visit);
        }

        if (Array.isArray(token.tokens)) {
          token.tokens.forEach(visit);
        }
      };

      tokens.forEach(visit);
    }),
  };
});

const createMdToDocx = require("../../index");

describe("integration: markdown to docx", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "md-to-docx-"));

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should generate a valid, non-corrupted .docx with expected formatting", async () => {
    const markdown = [
      "# Report Title",
      "",
      "This is **bold**, *italic*, and ~~strike~~ text.",
      "",
      "- Item one",
      "- Item two",
      "",
      "[Example link](https://example.com)",
      "",
      "| Col A | Col B |",
      "| --- | ---: |",
      "| A1 | B1 |",
      "",
      "```javascript",
      "const x = 1;",
      "```",
    ].join("\n");

    const mdToDocx = createMdToDocx();
    const children = mdToDocx.convert(markdown);

    const document = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(document);

    const outputPath = path.join(tmpDir, "integration-output.docx");
    fs.writeFileSync(outputPath, buffer);

    const fileBuffer = fs.readFileSync(outputPath);
    expect(fileBuffer.length).toBeGreaterThan(0);
    expect(fileBuffer.subarray(0, 2).toString()).toBe("PK");

    const zip = await JSZip.loadAsync(fileBuffer);

    expect(zip.file("[Content_Types].xml")).toBeTruthy();
    expect(zip.file("word/document.xml")).toBeTruthy();
    expect(zip.file("word/_rels/document.xml.rels")).toBeTruthy();

    const documentXml = await zip.file("word/document.xml").async("text");
    const relationshipsXml = await zip.file("word/_rels/document.xml.rels").async("text");

    expect(documentXml).toContain("<w:document");
    expect(documentXml).toContain("<w:tbl>");
    expect(documentXml).toContain("Heading1");
    expect(documentXml).toContain("<w:b");
    expect(documentXml).toContain("<w:i");
    expect(documentXml).toContain("<w:strike");
    expect(documentXml).toContain("•");
    expect(documentXml).toContain("Consolas");
    expect(documentXml).toContain("<w:hyperlink");

    expect(relationshipsXml).toContain("https://example.com");
  });

  it("should apply custom font and font size into generated document xml", async () => {
    const markdown = "Custom styled paragraph";
    const mdToDocx = createMdToDocx();
    const children = mdToDocx.convert(markdown, {
      font: "Times New Roman",
      fontSize: 30,
    });

    const document = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(document);

    const zip = await JSZip.loadAsync(buffer);
    const documentXml = await zip.file("word/document.xml").async("text");

    expect(documentXml).toContain("Times New Roman");
    expect(documentXml).toContain('w:sz w:val="30"');
  });

  it("should handle nested list + blockquote + code structures in one document", async () => {
    const markdown = [
      "# Nested Stress Test",
      "",
      "- Top item",
      "  > Quoted line",
      "  > ```javascript",
      "  > nested_code()",
      "  > ```",
      "  > - Nested bullet",
    ].join("\n");

    const mdToDocx = createMdToDocx();
    const children = mdToDocx.convert(markdown);
    const document = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(document);

    const zip = await JSZip.loadAsync(buffer);
    const documentXml = await zip.file("word/document.xml").async("text");

    expect(documentXml).toContain("Top item");
    expect(documentXml).toContain("Quoted line");
    expect(documentXml).toContain("Nested bullet");
    expect(documentXml).toContain("nested_code()");

    expect(documentXml).toContain("•");
    expect(documentXml).toContain("Consolas");
    expect(documentXml).toContain("w:pBdr");
    expect(documentXml).toContain("w:ind");
  });
});
