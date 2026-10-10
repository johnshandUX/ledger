import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const rootExport = packageJson.exports["."];

for (const target of new Set(Object.values(rootExport))) {
  await access(new URL(`..${target.slice(1)}`, import.meta.url), constants.R_OK);
}

const publicModule = await import(packageJson.name);
if (typeof publicModule.validateFinanceDataset !== "function") {
  throw new Error("Package root does not export validateFinanceDataset.");
}
if (
  publicModule.CALDERMERE_AS_OF !== "2026-10-07T09:00:00Z" ||
  publicModule.caldermereDataset?.businesses?.length !== 1
) {
  throw new Error("Package root does not export the canonical Caldermere dataset.");
}
if (
  typeof publicModule.getAccounts !== "function" ||
  typeof publicModule.getFinancialSnapshot !== "function"
) {
  throw new Error("Package root does not export selectors and calculations.");
}
if (
  publicModule.CALDERMERE_DEFAULT_SEED !== 1042 ||
  typeof publicModule.createCaldermereDataset !== "function"
) {
  throw new Error("Package root does not export the enriched Caldermere factory.");
}
if (
  typeof publicModule.createCaldermereScenario !== "function" ||
  publicModule.financeScenarios?.length !== 6
) {
  throw new Error("Package root does not export the Caldermere scenario surface.");
}
if (typeof publicModule.createFinanceQueryContext !== "function") {
  throw new Error("Package root does not export the read-only finance query context.");
}
if (
  publicModule.additionalAccessCatalogue?.[0]?.id !== "developer" ||
  typeof publicModule.getAdditionalAccessById !== "function" ||
  typeof publicModule.getRoles !== "function" ||
  typeof publicModule.getRoleById !== "function"
) {
  throw new Error("Package root does not export the user classification surface.");
}

console.log("Verified package export artifacts and root import.");
