import test from "node:test";
import assert from "node:assert/strict";
import { build } from "../../src/v1/index.js";

test("exports the orchestrator build function", () => {
    assert.equal(typeof build, "function");
});
