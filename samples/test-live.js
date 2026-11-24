import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { build } from "../src/v2/index.js";

const sampleDir = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.join(sampleDir, "output");
const PORT = 3088;
const baseUrl = `http://127.0.0.1:${PORT}`;

// Step 1: Re-build fresh output so we have clean test data
console.log("=============================================================");
console.log("  1. Building fresh output via V2 Orchestrator               ");
console.log("=============================================================");

build({
  clientRoot: sampleDir,
  outputRoot,
  required: [
    "app.js",
    "api/routes.js",
    "api/v1/routes.js",
    "api/v1/appointments/routes.js",
    "endpoints/fs/routes.js",
    "data/players.json",
    "data/appointments.json"
  ]
});
console.log("Fresh output ready at:", outputRoot);

// Step 2: Spawn live server process running `app.js`
console.log("\n=============================================================");
console.log(`  2. Spawning live Hono server: node app.js on port ${PORT} `);
console.log("=============================================================");

const serverProcess = spawn("node", ["app.js"], {
  cwd: outputRoot,
  env: { ...process.env, PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe"]
});

serverProcess.stderr.on("data", (chunk) => {
  console.error("Server STDERR:", chunk.toString());
});

// Helper: poll until server responds
async function waitForServer(url, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status !== undefined) return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error("Server failed to start within timeout");
}

try {
  await waitForServer(`${baseUrl}/api/v1/appointments`);
  console.log(`Live server is responding at ${baseUrl}!\n`);

  console.log("=============================================================");
  console.log("  3. Testing All CRUD & Strategy Endpoints                   ");
  console.log("=============================================================");

  // TEST 1: GET list all appointments
  console.log("\n--> [TEST 1] GET /api/v1/appointments (List)");
  const listRes = await fetch(`${baseUrl}/api/v1/appointments`);
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  console.log(`    Status: ${listRes.status} OK | Count: ${listData.length}`);
  assert.equal(listData.length, 2, "Initial records count should be 2");
  console.log("    Records:", listData.map((r) => `${r.id}: ${r.patientName}`));

  // TEST 2: GET read single appointment by ID
  console.log("\n--> [TEST 2] GET /api/v1/appointments/1 (Read Single)");
  const readRes = await fetch(`${baseUrl}/api/v1/appointments/1`);
  assert.equal(readRes.status, 200);
  const readData = await readRes.json();
  console.log(`    Status: ${readRes.status} OK | Patient: ${readData.patientName} (${readData.description})`);
  assert.equal(readData.patientName, "Ramesh Kumar");

  // TEST 3: POST create new appointment
  console.log("\n--> [TEST 3] POST /api/v1/appointments (Create)");
  const newAppointment = {
    patientName: "Vikram Reddy",
    mobileNumber: "9848199999",
    description: "Emergency Cardiology Consultation"
  };
  const postRes = await fetch(`${baseUrl}/api/v1/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newAppointment)
  });
  assert.equal(postRes.status, 201);
  const createdRecord = await postRes.json();
  console.log(`    Status: ${postRes.status} Created | New ID: ${createdRecord.id}`);
  assert.ok(createdRecord.id, "Record must have an auto-generated id");
  assert.equal(createdRecord.patientName, newAppointment.patientName);
  const createdId = createdRecord.id;

  // TEST 4: GET newly created appointment by ID
  console.log(`\n--> [TEST 4] GET /api/v1/appointments/${createdId} (Verify Created)`);
  const verifyRes = await fetch(`${baseUrl}/api/v1/appointments/${createdId}`);
  assert.equal(verifyRes.status, 200);
  const verifyData = await verifyRes.json();
  console.log(`    Status: ${verifyRes.status} OK | Found: ${verifyData.patientName}`);
  assert.equal(verifyData.description, newAppointment.description);

  // TEST 5: PUT update the newly created appointment
  console.log(`\n--> [TEST 5] PUT /api/v1/appointments/${createdId} (Update)`);
  const updatePayload = {
    patientName: "Vikram Reddy (VIP)",
    mobileNumber: "9848199999",
    description: "Scheduled Inpatient Cardiology Admission"
  };
  const putRes = await fetch(`${baseUrl}/api/v1/appointments/${createdId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload)
  });
  assert.equal(putRes.status, 200);
  const updatedRecord = await putRes.json();
  console.log(`    Status: ${putRes.status} OK | Updated: ${updatedRecord.patientName}`);
  assert.equal(updatedRecord.patientName, "Vikram Reddy (VIP)");
  assert.equal(updatedRecord.description, updatePayload.description);

  // TEST 6: DELETE the created appointment
  console.log(`\n--> [TEST 6] DELETE /api/v1/appointments/${createdId} (Delete)`);
  const deleteRes = await fetch(`${baseUrl}/api/v1/appointments/${createdId}`, {
    method: "DELETE"
  });
  assert.equal(deleteRes.status, 200);
  const deleteResult = await deleteRes.json();
  console.log(`    Status: ${deleteRes.status} OK | Result:`, deleteResult);

  // TEST 7: GET deleted appointment (should return 404)
  console.log(`\n--> [TEST 7] GET /api/v1/appointments/${createdId} (Verify 404)`);
  const notFoundRes = await fetch(`${baseUrl}/api/v1/appointments/${createdId}`);
  assert.equal(notFoundRes.status, 404);
  console.log(`    Status: ${notFoundRes.status} Not Found (Correct!)`);

  // TEST 8: GET Strategy endpoint /fs/file-sync
  console.log("\n--> [TEST 8] GET /fs/file-sync (File-Sync Strategy Endpoint)");
  const strategyRes = await fetch(`${baseUrl}/fs/file-sync`);
  assert.equal(strategyRes.status, 200);
  const strategyData = await strategyRes.json();
  console.log(`    Status: ${strategyRes.status} OK | Players Data Count: ${strategyData.length}`);
  assert.ok(Array.isArray(strategyData));

  // TEST 9: Verify Disk Persistence
  console.log("\n--> [TEST 9] Verify Disk Persistence in output/data/appointments.json");
  const diskData = JSON.parse(await fs.readFile(path.join(outputRoot, "data/appointments.json"), "utf8"));
  console.log(`    Final Records on Disk: ${diskData.length} items`);
  assert.equal(diskData.length, 2, "Should be back to 2 items after delete");

  console.log("\n=============================================================");
  console.log("  >>> ALL 9 LIVE CRUD & STRATEGY TESTS PASSED PERFECTLY! <<< ");
  console.log("=============================================================\n");

} finally {
  serverProcess.kill();
  console.log("Server process terminated cleanly.");
}
