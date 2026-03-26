const { autoTable } = require("jspdf-autotable");
const jspdfFonts = require("../../assets/js/jspdfFonts.js");
const marked = require("marked");
const he = require("he");

function checkHeight(doc, style) {
  if (style.currentHeight + style.lineSpc > style.pageHeight) {
    doc.addPage();
    return style.startHeight;
  } else {
    return style.currentHeight;
  }
}

function docSetStyle(doc, text, style) {
  const font = style.code ? "courier" : jspdfFonts.chooseFontForText(text);
  doc.setFont(font);
  doc.setFontSize(style.fontSize);
  doc.setTextColor(style.textColor);
  doc.setDrawColor(style.drawColor);
  if (style.bold && style.italic) {
    doc.setFont(font, "bolditalic");
  }
  else if (style.bold) {
    doc.setFont(font, "bold");
  }
  else if (style.italic) {
    doc.setFont(font, "italic");
  }
  else {
    doc.setFont(font, "normal");
  }
}

function breakLine(doc, distance, lastStyle) {
  var style = { ...lastStyle };
  style.currentHeight = style.currentHeight + distance;
  style.cursorIndex = style.currentWidth;
  style.currentHeight = checkHeight(doc, style);
  return style;
}

function writeToPDF(doc, text, lastStyle) {
  var style = { ...lastStyle };
  docSetStyle(doc, text, style);
  var splitText = doc.splitTextToSize(text, style.maxLineWidth);
  for (let i = 0; i < splitText.length; i++) {
    // move cursor to next line if overflow
    if (style.cursorIndex + doc.getTextWidth(splitText[i]) > style.maxLineWidth) {
      style.currentHeight = style.currentHeight + style.lineSpc;
      style.cursorIndex = style.currentWidth;
    }
    style.currentHeight = checkHeight(
      doc,
      style
    );
    docSetStyle(doc, splitText[i], style);
    if (style.link) {
      doc.textWithLink(splitText[i], style.cursorIndex, style.currentHeight, {
        url: style.link
      })
    }
    else {
      doc.text(splitText[i], style.cursorIndex, style.currentHeight);
    }
    if (style.strike) {
      doc.line(style.cursorIndex, style.currentHeight - 0.25 * style.fontSize, style.cursorIndex + doc.getTextWidth(splitText[i]), style.currentHeight - 0.25 * style.fontSize, 'S');
    }
    style.cursorIndex = style.cursorIndex + doc.getTextWidth(splitText[i]);
  }
  return style;
}

function processNode(doc, token, lastStyle) {
  console.log(token);
  let style = { ...lastStyle };
  const prev = { ...style };
  // no child tokens to process
  if (!Object.hasOwn(token, "tokens")) {
    switch (token.type) {
      case ("br"):
        style = breakLine(doc, style.lineDistance, style);
        break;
      case ("checkbox"):
        style.prefix = token.checked ? "[X] " : "[ ] ";
        style = writeToPDF(doc, style.prefix, style);
        style.prefix = prev.prefix;
        // var { CheckBox } = jsPDF.AcroForm;
        // var checkBox = new CheckBox();
        // checkBox.fieldName = "CheckBox1";
        // checkBox.Rect = [style.currentWidth, style.cursorIndex, style.fontSize, style.fontSize];
        // style.cursorIndex = style.cursorIndex + style.fontSize;
        // doc.addField(checkBox);
        // console.log(checkBox);
        break;
      case ("code"):
        style = breakLine(doc, style.lineSpc, style);
        style.code = true;
        if (token.codeBlockStyle) {
          style.currentWidth += style.indent;
          style.cursorIndex = style.currentWidth;
        }
        for (const line of token.lines) {
          style = writeToPDF(doc, line, style);
          style = breakLine(doc, style.lineDistance, style);
        }
        doc.rect(prev.startWidth - 10, prev.currentHeight, style.maxLineWidth - (prev.startWidth - 10), style.currentHeight - prev.currentHeight);
        style = breakLine(doc, style.lineDistance, style);
        style.code = prev.code;
        style.currentWidth = prev.currentWidth;
        break;
      case ("codespan"):
        style.code = true;
        style = writeToPDF(doc, token.text, style);
        style.code = prev.code;
        break;
      case ("def"):
        break;
      case ("hr"):
        style = breakLine(doc, style.lineSpc, style);
        doc.line(style.currentWidth, style.currentHeight, style.maxLineWidth, style.currentHeight, 'S');
        style = breakLine(doc, style.lineSpc, style);
        break;
      case ("html"):
        // currently not handling HTML tags
        break;
      case ("image"):
        // treat images as regular urls
        style.textColor = "#0000EE";
        style.link = token.href;
        style = writeToPDF(doc, token.text, style);
        if (token.title) {
          style = writeToPDF(doc, ` (${token.title})`, style);
        }
        style.textColor = prev.textColor;
        style.link = prev.link;
        break;
      case ("list"):
        style.prefix = "\u2022 ";
        style.currentWidth += style.indent;
        style.cursorIndex = style.currentWidth;
        for (let i = 0; i < token.items.length; i++) {
          const item = token.items[i];
          if (token.ordered) {
            style.prefix = `${token.start + i}. `
          }
          style = processNode(doc, item, style);
        }
        style.prefix = prev.prefix;
        style.currentWidth = prev.currentWidth;
        break;
      case ("space"):
        style = breakLine(doc, style.lineDistance, style);
        break;
      case ("table"):
        // handle table cells and table rows
        let tableHeaders = [];
        for (const header of token.header) {
          var headerData = header.text;
          tableHeaders.push(headerData);
        }
        let tableData = [];
        for (const row of token.rows) {
          var data = [];
          for (let i = 0; i < tableHeaders.length; i++) {
            data.push({
              content: row[i].text,
              styles: {
                halign: token.align[i] || 'center',
              }
            });
          }
          tableData.push(data);
        }
        style = breakLine(doc, style.lineDistance, style);
        autoTable(doc,
          {
            head: [tableHeaders],
            body: tableData,
            startY: style.currentHeight,
            tableWidth: style.maxLineWidth,
            pageBreak: "avoid",
            margin: style.currentWidth,
            didDrawPage: (d) => style.currentHeight = d.cursor.y,
          });
        style = breakLine(doc, style.lineDistance, style);
        break;
      case ("escape"):
      default:
        // text
        style = writeToPDF(doc, token.text, style);
        break;
    }
    return style;
  }
  switch (token.type) {
    case ("blockquote"):
      style.currentWidth += style.indent;
      style.cursorIndex = style.currentWidth;
      style.textColor = style.blockColor;
      style.drawColor = style.blockColor;
      style = breakLine(doc, style.lineDistance, style);
      style = DFS(doc, token.tokens, style);
      doc.line(prev.currentWidth, prev.currentHeight + prev.lineDistance, prev.currentWidth, style.currentHeight, 'S');
      style.currentWidth = prev.currentWidth;
      style.textColor = prev.textColor;
      style.drawColor = prev.drawColor;
      break;
    case ("del"):
      style.drawColor = style.textColor;
      style.strike = true;
      style = DFS(doc, token.tokens, style);
      style.drawColor = prev.drawColor;
      style.strike = prev.strike;
      break;
    case ("em"):
      style.italic = true;
      style = DFS(doc, token.tokens, style);
      style.italic = prev.italic;
      break;
    case ("heading"):
      style.fontSize = 31 - 3 * token.depth;
      style.bold = true;
      style = breakLine(doc, style.lineSpc + style.fontSize, style);
      style = DFS(doc, token.tokens, style);
      style = breakLine(doc, style.lineSpc, style);
      style.fontSize = prev.fontSize;
      style.bold = prev.bold;
      break;
    case ("image"):
    case ("link"):
      style.textColor = "#0000EE";
      style.link = token.href;
      style = DFS(doc, token.tokens, style);
      if (token.title) {
        style = writeToPDF(doc, ` (${token.title})`, style);
      }
      style.textColor = prev.textColor;
      style.link = prev.link;
      break;
    case ("list_item"):
      style = breakLine(doc, token.loose ? style.lineSpc : style.lineDistance, style);
      if (token.task) {
        style.prefix += token.checked ? "[X] " : "[ ] ";
      }
      style = writeToPDF(doc, style.prefix, style);
      style.prefix = prev.prefix;
      style = DFS(doc, token.tokens, style);
      break;
    case ("paragraph"):
      style = breakLine(doc, style.lineDistance, style);
      style = DFS(doc, token.tokens, style);
      break;
    case ("strong"):
      style.bold = true;
      style = DFS(doc, token.tokens, style);
      style.bold = prev.bold;
      break;
    case ("text"):
      style = DFS(doc, token.tokens, style);
      break;
    default:
      break;
  }
  return style;
}

function DFS(doc, tokens, lastStyle) {
  let style = { ...lastStyle };
  for (const t of tokens) {
    style = processNode(doc, t, style);
  }
  return style;
}


module.exports = () => {
  return {
    convert(doc,
      fontSize,
      textColor,
      text,
      currentWidth,
      lineSpc,
      currentHeight,
      maxLineWidth,
      pageHeight,
    ) {
      var style = {
        lineDistance: 10,
        startWidth: 60,
        startHeight: 70,
        indent: 8,
        blockColor: "#858585",
        currentWidth: currentWidth,
        currentHeight: currentHeight,
        cursorIndex: currentWidth,
        fontSize: fontSize,
        textColor: textColor,
        drawColor: textColor,
        lineSpc: lineSpc,
        maxLineWidth: maxLineWidth,
        pageHeight: pageHeight,
        prefix: "",
        bold: false,
        italic: false,
        strike: false,
        code: false,
        link: null,
      }
      console.log(text);
      const tokens = marked.lexer(text, { gfm: true, breaks: true });
      console.log(tokens);
      // decode HTML text
      marked.walkTokens(tokens, (token) => {
        if (token.text) token.text = he.decode(token.text);
        if (token.type === "code") token.lines = token.text.split("\n");
      });
      style = DFS(doc, tokens, style);
      currentHeight = style.currentHeight;
      return currentHeight;
    },
  }
}
