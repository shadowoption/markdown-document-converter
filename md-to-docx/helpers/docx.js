const path = require("path");

function resolveDocx() {
  const lookupPaths = [];

  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    lookupPaths.push(process.cwd());
  }

  lookupPaths.push(path.join(__dirname, ".."));

  try {
    const resolved = require.resolve("docx", { paths: lookupPaths });
    return require(resolved);
  } catch (error) {
    return require("docx");
  }
}

module.exports = resolveDocx();