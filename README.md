# json-api-builder

[![npm version](https://img.shields.io/npm/v/json-api-builder?color=cb3837&style=flat-square)](https://www.npmjs.com/package/json-api-builder)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg?style=flat-square)](package.json)
[![GitHub Repository](https://img.shields.io/badge/GitHub-keshavsoft%2Fjson-api-builder-orchestrator-181717.svg?style=flat-square&logo=github)](https://github.com/keshavsoft/json-api-builder-orchestrator)
[![Documentation](https://img.shields.io/badge/docs-live_portal-amber.svg?style=flat-square)](https://keshavsoft.github.io/json-api-builder-orchestrator/)

> **Orchestrator**: Master Orchestrator: End-to-End JSON-Driven Backend API Generator

Part of the modular **[JSON API Builder](https://github.com/keshavsoft/json-api-builder-orchestrator)** ecosystem by [KeshavSoft](https://github.com/keshavsoft).

---

## The Story

The master conductor of the modular JSON API Builder pipeline. Coordinates all 7 independent stages in deterministic order to generate a complete, validated, production-grade Hono backend.

### The Problem It Solves
Running 7 independent build stages manually introduces operational friction and configuration drift across data pipelines and micro-services.

### The Solution
Exposes a single, unified build() function that chains pre-flight validation, folder creation, file provisioning, template compilation, route hooking, app bootstrap, endpoints generation, and post-build verification.

---

## Architecture & Pipeline Position

```
[1. Folders] ──▶ [2. Files] ──▶ [3. Content] ──▶ [4. Hook Routes]
                                                         │
[8. Orchestrator] ◀── [7. Validate] ◀── [6. Endpoints] ◀── [5. App]
```

**This package orchestrates the entire pipeline from end to end.**

---

## Installation

```bash
npm install json-api-builder
```

---

## Quick Start

```js
import { build } from "json-api-builder";

const result = build({
    clientRoot: "./my-client-project"
});

console.log("Application generated at:", result.outputRoot);
console.log("Validation passed:", result.validation.valid);
```

---

## Input Specification

Standard client input layout with source-of-truth tree and data models.

```json
my-client-project/
└── input/
    ├── data/
    │   ├── clinics.json
    │   └── players.json
    └── source-of-truth/
        ├── tree.json
        ├── openapi.json
        └── routes.estree.json
```

---

## Output Transformation

Complete, structured, and runnable Hono backend application.

```text
my-client-project/output/
├── app.js                   (Hono app root)
├── api/
│   ├── routes.js            (mounted /api router)
│   └── v1/
│       ├── routes.js        (mounted /api/v1 router)
│       └── clinics/
│           └── routes.js    (mounted /api/v1/clinics router)
├── endpoints/
│   └── fs/
│       └── routes.js        (mounted /fs file-sync router)
└── data/
    ├── clinics.json
    └── players.json
```

---

## API Reference

### `build`

Accepts an options object with the following configuration:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `clientRoot` | `string` | `process.cwd()` | Root path of client project containing input/ and receiving output/. |
| `outputRoot` | `string` | `path.join(clientRoot, 'output')` | Target output directory. |
| `inputRoot` | `string` | `path.join(clientRoot, 'input')` | Directory containing source-of-truth and data. |

---

## Sibling Pipeline Packages

| Stage | Package | Description |
| :---: | :--- | :--- |
| **01** | [json-api-builder-create-folders](https://github.com/keshavsoft/json-api-builder-create-folders) | Directory hierarchy scaffolding |
| **02** | [json-api-builder-create-files](https://github.com/keshavsoft/json-api-builder-create-files) | Non-destructive placeholder file creation |
| **03** | [json-api-builder-insert-content](https://github.com/keshavsoft/json-api-builder-insert-content) | ESTree template to JavaScript insertion |
| **04** | [json-api-builder-alter-content](https://github.com/keshavsoft/json-api-builder-alter-content) | Hierarchical route hooking & AST imports |
| **05** | [json-api-builder-create-app](https://github.com/keshavsoft/json-api-builder-create-app) | Root app.js assembly & server runtime |
| **06** | [json-api-builder-create-endpoints](https://github.com/keshavsoft/json-api-builder-create-endpoints) | CRUD endpoints & local JSON file sync |
| **07** | [json-api-builder-validation](https://github.com/keshavsoft/json-api-builder-validation) | Specification linting & artifact checks |
| **08** | [json-api-builder](https://github.com/keshavsoft/json-api-builder-orchestrator) | Master orchestrator coordinating all stages |

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Run syntax check
npm run check

# Prepublish verification
npm run prepublishOnly
```

---

## License

[MIT](LICENSE) © 2026 [KeshavSoft](https://github.com/keshavsoft)
