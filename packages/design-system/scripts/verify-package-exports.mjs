import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

const targets = new Set();

function collectTargets(value) {
  if (typeof value === "string") {
    targets.add(value);
    return;
  }

  for (const nestedValue of Object.values(value)) {
    collectTargets(nestedValue);
  }
}

collectTargets(packageJson.exports);

const missing = [];
for (const target of targets) {
  try {
    await access(new URL(target, `file://${packageRoot}/`), constants.R_OK);
  } catch {
    missing.push(target);
  }
}

if (missing.length > 0) {
  throw new Error(`Missing package export artifacts:\n${missing.map((target) => `- ${target}`).join("\n")}`);
}

console.log(`Verified ${targets.size} package export artifacts.`);
