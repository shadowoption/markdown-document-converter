# Hunchly Markdown Converter

A JavaScript library for converting Markdown text into multiple output formats. The initial focus is **Markdown → DOCX**, with a shared architecture designed to support additional renderers such as **Markdown → PDF**.

The library exposes a **single, stable root-level API** while keeping format-specific logic modular and well-tested.

> **Note:** This is an actively developed library. While the core functionality is production-ready, real‑world usage may reveal additional edge cases. Feedback and bug reports are welcome.


## Overview

`hunchly-markdown-converter` provides a complete Markdown processing pipeline that tokenizes input once and renders it into one or more output formats.

Currently supported:

- ✅ Markdown → DOCX
- ⏳ Markdown → PDF (planned / in progress)


This module provides a complete pipeline for converting Markdown to DOCX format with support for:
- Headings (H1-H6)
- Text formatting (bold, italic, strikethrough)
- Lists (ordered and unordered, including task lists)
- Code blocks and inline code
- Tables with alignment
- Blockquotes
- Links and images
- Horizontal rules
- HTML entity decoding
- Custom styling

## Project Structure

```
md-to-docx/
├── README.md                    # This file
├── index.js                     # Factory function (entry point)
├── MarkdownToDocx.js            # Main converter class
│
├── helpers/                     # Helper functions for document building
│   ├── code.js                  # Code block and inline code handling
│   ├── link.js                  # Hyperlink and image handling
│   ├── list.js                  # List and checkbox handling
│   ├── table.js                 # Table processing and cell creation
│   ├── heading.js               # Heading levels and formatting
│   ├── lines.js                 # Line breaks and horizontal rules
│   ├── styles.js                # Style management and constants
│   ├── paragraph.js             # Paragraph grouping and formatting
│   ├── blockquote.js            # Blockquote styling
│   └── text.js                  # Text styling and formatting
│
├── processors/                  # Token processing pipeline
│   ├── dfs.js                   # Depth-first search tree traversal
│   ├── parent.js                # Processing tokens with children
│   └── child.js                 # Processing leaf tokens
│
└── tests/                       # Jest test suite (292 tests)
    ├── unit_tests/              # Jest tests for helper functions (196 tests)
    ├── processors/              # Jest tests for processors (51 tests)
    ├── MarkdownToDocx.test.js    # Jest tests for main class (25 tests)
    └── index.test.js            # Jest tests for factory function (20 tests)
```

## Architecture

### Data Flow

```
Markdown Text
     ↓
[marked.lexer]  - Tokenizes markdown using marked library
     ↓
Token Array
     ↓
[marked.walkTokens]  - Walks tokens to preprocess (decode HTML, split code)
     ↓
Processed Tokens
     ↓
[DFS]  - Depth-first search traversal
     ↓
├─→ [processParent]  - Handles tokens with children (headings, paragraphs, etc.)
│       ↓
│   ├─→ [writeBlockquote]
│   ├─→ [writeHeading]
│   ├─→ [writeLink]
│   ├─→ [writeListItem]
│   └─→ [setTextStyle + DFS]
│
└─→ [processChild]  - Handles leaf tokens
        ↓
        ├─→ [writeCode / writeCodeSpan]
        ├─→ [writeCheckBox]
        ├─→ [writeList]
        ├─→ [processTable]
        ├─→ [horizontalLine]
        └─→ [writeText]
     ↓
Style-aware Text Runs & Paragraphs
     ↓
[groupParagraph]  - Group text runs into styled paragraphs
     ↓
DOCX Paragraph[] / Table[]
```

## Usage

### Initialization and Basic Usage

The library uses a factory pattern. Invoke it immediately when requiring and call `convert()` on the returned instance:

```javascript
const { mdToDocx } = require("hunchly-markdown-converter");
```

**Full Example:**

```javascript
const { mdToDocx } = require("hunchly-markdown-converter");

const markdown = `
# Hello World

This is **bold** and *italic* text.

- Item 1
- Item 2

\`\`\`javascript
const x = 5;
\`\`\`
`;

const paragraphs = mdToDocx.convert(markdown);
// Returns an array of docx.Paragraph and docx.Table objects
```

### Custom Styling

Pass a style object as the second parameter to `convert()`:

```javascript
const { mdToDocx } = require("hunchly-markdown-converter");

const customStyle = {
  font: "Times New Roman",
  fontSize: 24,
  textColor: "000000"
};

const paragraphs = mdToDocx.convert(markdown, customStyle);
```

### Integration with docx library

```javascript
const { Document, Packer } = require('docx');
const { mdToDocx } = require("hunchly-markdown-converter");

const paragraphs = mdToDocx.convert(markdownText);

const doc = new Document({ sections: [{ children: paragraphs }] });
const filepath = 'output.docx';
Packer.toFile(doc, filepath);
```

## Features

### Supported Markdown

| Feature | Example | Status |
|---------|---------|--------|
| Headings | `# H1, ## H2, ... ###### H6` | ✅ |
| Bold | `**bold** or __bold__` | ✅ |
| Italic | `*italic* or _italic_` | ✅ |
| Strikethrough | `~~text~~` | ✅ |
| Inline Code | `` `code` `` | ✅ |
| Code Blocks | `` ```code``` `` | ✅ |
| Lists | `- item` or `1. item` | ✅ |
| Task Lists | `- [ ] unchecked` `- [x] checked` | ✅ |
| Tables | `\| col \| col \|` | ✅ |
| Blockquotes | `> quote` | ✅ |
| Links | `[text](url)` | ✅ |
| Images | `![alt](url)` | ✅ (as links) |
| Horizontal Rules | `---` or `***` | ✅ |
| HTML Entities | `&lt;` `&amp;` etc. | ✅ (decoded) |

## Known Limitations

As a newly developed library, the following areas may need refinement through real-world usage:

- **Complex Nested Structures** - Deeply nested formatting and lists may not render exactly as expected
- **Custom Image Handling** - Images are currently converted to hyperlinks; direct image embedding is not yet supported
- **HTML Content** - HTML tags in markdown are currently ignored
- **Extended Attributes** - Markdown extensions like task priorities, custom containers, or strikethrough variants are not supported
- **Page Break Control** - No explicit page break support
- **Font Fallback** - Does not implement font fallback; specified fonts must be available on the system

## Testing


### Jest Test Suite Overview

**Total:** 292 tests across 15 test files

| Category | Tests | Files |
|----------|-------|-------|
| Helper Functions | 196 | 10 |
| Processors | 51 | 3 |
| Main Class | 25 | 1 |
| Factory Function | 20 | 1 |

### Running Jest Tests

```bash
# All md-to-docx tests
cd md-to-docx
npm run test
```

## Dependencies

- **docx** ^9.5.3 - DOCX document generation
- **marked** ^17.0.4 - Markdown parsing and tokenization
- **he** ^1.2.0 - HTML entity encoding/decoding

### Development Dependencies

- **jest** ^29.7.0 - Testing framework
