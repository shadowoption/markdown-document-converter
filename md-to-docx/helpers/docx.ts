import path from "node:path";

function resolveDocx(): typeof import("docx") {
  const lookupPaths: string[] = [];

  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    lookupPaths.push(process.cwd());
  }

  lookupPaths.push(path.join(__dirname, ".."));

  try {
    const resolved = require.resolve("docx", { paths: lookupPaths });
    return require(resolved) as typeof import("docx");
  } catch (error) {
    return require("docx") as typeof import("docx");
  }
}

const docx = resolveDocx();

export = docx;
