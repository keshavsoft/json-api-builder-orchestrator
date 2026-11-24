import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as v2 from "../../src/v2/index.js";

const clientRoot = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.join(clientRoot, "output");

test("V2 exports the orchestrator API", () => {
    assert.equal(typeof v2.build, "function", "build must be exported from v2");
});

test("V2 orchestrator builds complete application purely via AST and astring", () => {
    fs.rmSync(outputRoot, { recursive: true, force: true });

    const result = v2.build({ clientRoot });

    assert.equal(result.outputRoot, outputRoot);
    assert.equal(result.validation.valid, true);

    const expected = [
        "app.js",
        "api/routes.js",
        "api/v1/routes.js",
        "api/v1/clinics/routes.js",
        "endpoints/fs/routes.js",
        "data/clinics.json",
        "data/players.json"
    ];

    for (const file of expected) {
        const filePath = path.join(outputRoot, file);
        assert.ok(fs.existsSync(filePath), `Generated file missing: ${file}`);
    }

    console.log("--> V2 Complete application generated and verified at:", outputRoot);
});
