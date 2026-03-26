# Markdown Document Converter

`markdown-document-converter` is a TypeScript library for converting Markdown into:

- DOCX document children (`Paragraph` and `Table`) for use with `docx` `Document` sections
- PDF output via a caller-provided `jsPDF`-compatible document instance

## Current Status

- Language: **TypeScript** (source in `.ts`, compiled to `dist/`)
- Primary outputs: **Markdown → DOCX** and **Markdown → PDF**
- API surface: stable root export with:
  - `mdToDocx.convert(text, style?)`
  - `mdToPdf.convert(doc, text, style?)`
- Build strategy: **build-on-install** (`prepare` runs `npm run build`)

## Installation

### From npm

Coming soon...

### From GitHub main branch

```bash
npm install github:shadowoption/markdown-document-converter#main
```

When installing from GitHub, the package builds automatically via the `prepare` script.

### Local development with `npm link`

In this library repo:

```bash
npm install
npm run build
npm link
```

In your consuming project:

```bash
npm link markdown-document-converter
npm install docx jspdf
```

For iterative local development, run this in the library repo while editing:

```bash
npm run build:watch
```

This keeps `dist/` updated so the linked consumer sees current changes.

## API

### Root export

```ts
const { mdToDocx, mdToPdf } = require("markdown-document-converter");
```

### DOCX signature

```ts
mdToDocx.convert(text: string, style?: Partial<MarkdownStyle>): DocxBlock[]
```

- `text`: markdown input
- `style`: optional style overrides
- returns: `DocxBlock[]` where `DocxBlock = Paragraph | Table`

### PDF signature

```ts
mdToPdf.convert(doc: JsPdfDoc, text: string, style?: Partial<PdfStyle>): number
```

- `doc`: a `jsPDF`-compatible document object (consumer-provided)
- `text`: markdown input
- `style`: optional style overrides
- returns: final vertical cursor position (`currentHeight`) after rendering

### `MarkdownStyle` fields (DOCX)

All style fields are optional in `convert(..., style)` and merged over defaults.

- `font: string`
- `textColor: string`
- `linkColor: string`
- `blockColor: string`
- `fontSize: number`
- `indentLevel: number`
- `headingLevel: DocxHeadingLevel | null`
- `link: string | null`
- `bold: boolean`
- `italics: boolean`
- `strike: boolean`
- `code: boolean`
- `quote: boolean`
- `ordered: boolean`
- `prefix?: string`

### `PdfStyle` fields (PDF)

All style fields are optional in `convert(..., style)` and merged over defaults.

- `font: string | null`
- `lineDistance: number`
- `startWidth: number`
- `startHeight: number`
- `indent: number`
- `blockColor: string`
- `currentWidth: number`
- `currentHeight: number`
- `cursorIndex: number`
- `fontSize: number`
- `textColor: string`
- `linkColor: string`
- `drawColor: string`
- `lineSpc: number`
- `maxLineWidth: number`
- `pageHeight: number`
- `bold: boolean`
- `italics: boolean`
- `strike: boolean`
- `code: boolean`
- `link: string | null`
- `skipParagraphBreak: boolean`

## Usage

### Convert markdown to DOCX children

```js
const { mdToDocx } = require("markdown-document-converter");

const markdown = `
# Hello World

This is **bold** and *italic* text.

- Item 1
- Item 2
`;

const children = mdToDocx.convert(markdown, {
  font: "Times New Roman",
  fontSize: 24,
  textColor: "000000",
});
```

### Write a `.docx` file using `docx`

```js
const { Document, Packer } = require("docx");
const { mdToDocx } = require("markdown-document-converter");

const children = mdToDocx.convert("# Title\n\nBody text");
const document = new Document({ sections: [{ children }] });

Packer.toFile(document, "output.docx");
```

### Convert markdown to PDF using `jsPDF`

```js
const { jsPDF } = require("jspdf");
const { mdToPdf } = require("markdown-document-converter");

const markdown = `
# PDF Title

This is **bold** text in PDF.

1. First
2. Second
`;

const doc = new jsPDF({ unit: "pt", format: "letter" });

mdToPdf.convert(doc, markdown, {
  startWidth: 48,
  startHeight: 56,
  maxLineWidth: 560,
});

doc.save("output.pdf");
```

## Project Structure

```text
index.ts
jest.config.ts
tsconfig.json
md-to-docx/
  index.ts
  MarkdownToDocx.ts
  types.ts
  helpers/
    blockquote.ts
    code.ts
    docx.ts
    heading.ts
    lines.ts
    link.ts
    list.ts
    paragraph.ts
    styles.ts
    table.ts
    text.ts
  processors/
    child.ts
    dfs.ts
    parent.ts
  tests/
    ...all test files are .test.ts
md-to-pdf/
  index.ts
  MarkdownToPdf.ts
  types.ts
  helpers/
    blockquote.ts
    code.ts
    heading.ts
    lines.ts
    link.ts
    list.ts
    style.ts
    table.ts
    text.ts
  processors/
    child.ts
    dfs.ts
    parent.ts
  tests/
    ...all test files are .test.ts
tests/
  root-index.test.ts
```

## Parsing and token model

- Markdown parsing uses `marked.lexer(...)`
- Token traversal uses `marked.walkTokens(...)`
- Internal token typing uses **official `marked` token types** (`Token`, `Tokens.*`)

### Tokens not currently supported (or only partially supported)

The converters explicitly handle a subset of standard `marked` tokens. The following token categories are currently not rendered as rich DOCX/PDF features:

- `def` tokens (link definitions) are currently ignored.
- Raw HTML tokens (`html` / tag-like html token output) are not rendered as rich content.
- Extension/plugin tokens from extended markdown are not explicitly mapped yet.

Examples of extended markdown features that are not currently implemented as dedicated handlers include:

- footnotes
- definition lists
- admonitions/custom containers
- math/LaTeX blocks
- citations/references and other custom plugin token types

Unknown token shapes may fall back to plain text behavior when possible.

## Supported Markdown

Both converters support:

- Headings (`#` to `######`)
- Bold / italic / strikethrough
- Inline code and fenced code blocks
- Ordered and unordered lists (including task list tokens)
- Tables with alignment
- Blockquotes
- Links and images (images handled as links)
- Horizontal rules
- HTML entity decoding (`he`)

## Build, Test, and Output

### Scripts

- `npm run build` → compile TypeScript to `dist/`
- `npm run build:watch` → watch-mode compile
- `npm run test` → run Jest with coverage

### Package outputs

- Runtime entry: `dist/index.js`
- Type declarations: `dist/index.d.ts`

## Testing

- Test framework: Jest + ts-jest
- Test files: TypeScript (`*.test.ts`)
- Current suite size: **375 tests**

## Dependencies

- Runtime:
  - `marked`
  - `he`
  - `jspdf-autotable`
  - `docx` (peer dependency for DOCX output)
- Consumer dependencies:
  - `jspdf` (required when using `mdToPdf`)
- Dev:
  - `typescript`
  - `jest`
  - `ts-jest`
  - `ts-node`
  - `@types/jest`
  - `@types/node`
  - `jszip`

## Notes / Limitations

- Complex deeply nested markdown can still surface edge cases.
- Raw HTML content is not rendered as rich DOCX/PDF HTML.
- Images are currently routed through link handling rather than direct image embedding.
- `mdToPdf` expects a compatible `jsPDF` document instance to be provided by the consumer.
