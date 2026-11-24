#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import { build } from "../src/v2/index.js";

const clientRoot = process.cwd();
const inputRoot = path.join(clientRoot, "input");
const outputRoot = path.join(clientRoot, "output");

console.log("=============================================================");
console.log("  JSON API Builder Orchestrator (CLI)                        ");
console.log("=============================================================");

if (!fs.existsSync(inputRoot)) {
    console.error(`\n❌ Error: 'input' directory not found at: ${inputRoot}`);
    console.error("Please run this command inside a directory that contains an 'input' folder.\n");
    process.exit(1);
}

try {
    console.log(`- Working Directory: ${clientRoot}`);
    console.log(`- Input Root:        ${inputRoot}`);
    console.log(`- Output Root:       ${outputRoot}`);

    const apiJsonPath = path.join(inputRoot, "api.json");
    let required = undefined;

    if (fs.existsSync(apiJsonPath)) {
        try {
            const apiConfig = JSON.parse(fs.readFileSync(apiJsonPath, "utf8"));
            const requiredSet = new Set(["app.js", "api/routes.js"]);

            if (apiConfig.routes) {
                for (const [vKey, vVal] of Object.entries(apiConfig.routes)) {
                    requiredSet.add(`api/${vKey}/routes.js`);
                    for (const [rKey, rVal] of Object.entries(vVal)) {
                        requiredSet.add(`api/${vKey}/${rKey}/routes.js`);
                        if (rVal.dataFile) requiredSet.add(rVal.dataFile);
                    }
                }
            }
            if (apiConfig.strategies?.fs) {
                requiredSet.add("endpoints/fs/routes.js");
                for (const sVal of Object.values(apiConfig.strategies.fs)) {
                    if (sVal.dataFile) requiredSet.add(sVal.dataFile);
                }
            }
            required = Array.from(requiredSet);
        } catch {
            // fallback to default verification
        }
    }

    const result = build({
        clientRoot,
        outputRoot,
        ...(required ? { required } : {})
    });

    // Ensure output has package.json with hono dependencies
    const outputPkgPath = path.join(outputRoot, "package.json");
    if (!fs.existsSync(outputPkgPath)) {
        fs.writeFileSync(outputPkgPath, JSON.stringify({
            name: "generated-api",
            version: "1.0.0",
            type: "module",
            scripts: {
                start: "node app.js"
            },
            dependencies: {
                "hono": "^4.6.14",
                "@hono/node-server": "^1.13.7"
            }
        }, null, 2) + "\n");
    }

    console.log("\n[Build Result]");
    console.log("✔ Application generated successfully!");
    console.log(`- Output Directory:  ${result.outputRoot}`);
    console.log(`- Master App:        ${result.appPath}`);
    console.log(`- Checked Files:     ${result.validation.checkedFiles}`);
    console.log(`- Checked JS Files:  ${result.validation.checkedJavaScript}`);
    console.log(`- Checked JSON Files:${result.validation.checkedJson}`);
    console.log("\nTo start your API server, run:");
    console.log("  cd output && npm i && npm start");
    console.log("=============================================================\n");
} catch (error) {
    console.error("\n❌ Build failed:", error.message);
    process.exit(1);
}
