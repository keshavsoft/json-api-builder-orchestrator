import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { build } from "../src/v2/index.js";

const sampleDir = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = sampleDir;
const outputRoot = path.join(sampleDir, "output");

// Clean previous output directory
fs.rmSync(outputRoot, { recursive: true, force: true });

const required = [
  "app.js",
  "api/routes.js",
  "api/v1/routes.js",
  "api/v1/appointments/routes.js",
  "endpoints/fs/routes.js",
  "data/players.json",
  "data/appointments.json"
];

console.log("=============================================================");
console.log("  Running V2 JSON API Builder Orchestrator Sample            ");
console.log("=============================================================");

const result = build({
  clientRoot,
  outputRoot,
  required
});

console.log("\n[Build Result]");
console.log("- Output Root:       ", result.outputRoot);
console.log("- Master App Path:   ", result.appPath);
console.log("- Validation Passed: ", result.validation.valid);
console.log("- Checked Files:     ", result.validation.checkedFiles);
console.log("- Checked JS Files:  ", result.validation.checkedJavaScript);
console.log("- Checked JSON Files:", result.validation.checkedJson);

const appJsContent = fs.readFileSync(result.appPath, "utf8");
const firstLine = appJsContent.split(/\r?\n/)[0];

console.log("\n[First line of generated app.js]:");
console.log(firstLine);
console.log("=============================================================\n");
