# @keshavsoft/json-api-builder

The orchestrator repository. It imports the independent JSON API Builder stage packages and coordinates them in the established V9 execution order.

## Architecture

Each implementation package contains only its own stage implementation under `src/v1/`. This repository contains orchestration only.

## Use

```js
import { build } from "@keshavsoft/json-api-builder";

const result = build({
    clientRoot: "/absolute/path/to/client-project"
});
```

The client project must provide the same input files and configuration expected by the original V9 stages.

## Development

```bash
npm install
npm test
npm run check
npm pack --dry-run
```

Publish the stage packages first, then install this orchestrator and publish it.

This repository is prepared locally only. No npm publication or GitHub push has been performed.
