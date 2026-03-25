# Hunchly Markdown Converter

`hunchly-markdown-converter` is a TypeScript library for converting Markdown into DOCX document children (`Paragraph` and `Table`) that can be passed directly into `docx` `Document` sections.

## Current Status

- Language: **TypeScript** (source in `.ts`, compiled to `dist/`)
- Primary output: **Markdown → DOCX**
- API surface: stable root export with `mdToDocx.convert(text, style?)`
- Build strategy: **build-on-install** (`prepare` runs `npm run build`)

## Installation

### From npm

Coming soon...

### From GitHub main branch

```bash
npm install github:shadowoption/hunchly-markdown-converter#main
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
npm link hunchly-markdown-converter
npm install docx
```

For iterative local development, run this in the library repo while editing:

```bash
npm run build:watch
```

This keeps `dist/` updated so the linked consumer sees current changes.

## API

### Root export

```ts
const { mdToDocx } = require("hunchly-markdown-converter");
```

### Function signature

```ts
mdToDocx.convert(text: string, style?: Partial<MarkdownStyle>): DocxBlock[]
```

- `text`: markdown input
- `style`: optional style overrides
- returns: `DocxBlock[]` where `DocxBlock = Paragraph | Table`

### `MarkdownStyle` fields

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

## Usage

### Convert markdown to docx children

```js
const { mdToDocx } = require("hunchly-markdown-converter");

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
const { mdToDocx } = require("hunchly-markdown-converter");

const children = mdToDocx.convert("# Title\n\nBody text");
const document = new Document({ sections: [{ children }] });

Packer.toFile(document, "output.docx");
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
tests/
  root-index.test.ts
```

## Parsing and token model

- Markdown parsing uses `marked.lexer(...)`
- Token traversal uses `marked.walkTokens(...)`
- Internal token typing uses **official `marked` token types** (`Token`, `Tokens.*`)

### Tokens not currently supported (or only partially supported)

The converter explicitly handles a subset of standard `marked` tokens. The following token categories are currently not rendered as rich DOCX features:

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
- Current suite size: **308 tests**

## Dependencies

- Runtime:
  - `marked`
  - `he`
  - `docx` (peer dependency)
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
- Raw HTML content is not rendered as rich DOCX HTML.
- Images are currently routed through link handling rather than direct image embedding.
