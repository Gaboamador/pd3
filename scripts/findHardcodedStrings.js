import fs from "fs";
import path from "path";

const ROOT = "./src";
const OUTPUT = "./hardcoded_strings.csv";

const IGNORE_PATTERNS = [
  /t\(/,
  /console\./,
  /import\s/,
  /require\(/,
  /className/,
  /style=/,
  /id=/,
  /key=/
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const results = [];

  lines.forEach((line, i) => {
    const matches = line.match(/["'`](.+?)["'`]/g);
    if (!matches) return;

    matches.forEach((m) => {
      const text = m.slice(1, -1).trim();

      if (!text) return;
      if (text.length < 2) return;

      const ignored = IGNORE_PATTERNS.some((p) => p.test(line));
      if (ignored) return;

      results.push({
        file: filePath,
        line: i + 1,
        text
      });
    });
  });

  return results;
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  let results = [];

  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      results = results.concat(walk(full));
      continue;
    }

    if (!full.endsWith(".js") && !full.endsWith(".jsx")) continue;

    results = results.concat(scanFile(full));
  }

  return results;
}

const results = walk(ROOT);

results.sort((a, b) => {
  if (a.file === b.file) return a.line - b.line;
  return a.file.localeCompare(b.file);
});

const csv =
  "file,line,text\n" +
  results
    .map((r) =>
      `"${r.file}",${r.line},"${r.text.replace(/"/g, '""')}"`
    )
    .join("\n");

fs.writeFileSync(OUTPUT, csv);

console.log(`Found ${results.length} strings`);
console.log(`Saved to ${OUTPUT}`);