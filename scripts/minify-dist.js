import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { minify } from "terser";

const DIST_DIR = "dist";

async function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.endsWith(".js") || entry.endsWith(".min.js")) {
      continue;
    }

    const code = readFileSync(fullPath, "utf8");

    const result = await minify(code, {
      compress: true,
      mangle: true,
      format: {
        comments: false,
      },
    });

    writeFileSync(fullPath, result.code);
    console.log("Minified:", fullPath);
  }
}

walk(DIST_DIR).catch(console.error);