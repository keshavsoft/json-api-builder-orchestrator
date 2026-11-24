import path from "node:path";
import { createFolders } from "../../../json-api-builder-create-folders/src/index.js";
import { createFiles } from "../../../json-api-builder-create-files/src/index.js";
import { insertContent } from "../../../json-api-builder-insert-content/src/v2/index.js";
import { hookRoutes } from "../../../json-api-builder-alter-content/src/v2/index.js";
import { buildApp } from "../../../json-api-builder-create-app/src/v2/index.js";
import { createEndpoints, createFileSyncEndpoint } from "../../../json-api-builder-create-endpoints/src/v2/index.js";
import { validateConfiguration, verifyGeneratedApp } from "../../../json-api-builder-validation/src/index.js";

export function build(options = {}) {
    const clientRoot = path.resolve(options.clientRoot ?? process.cwd());
    const outputRoot = path.resolve(options.outputRoot ?? path.join(clientRoot, "output"));

    validateConfiguration({ ...options, clientRoot });
    createFolders({ ...options, clientRoot, outputRoot });
    createFiles({ ...options, clientRoot, outputRoot });
    insertContent({ ...options, clientRoot, outputRoot });
    hookRoutes({ ...options, clientRoot, outputRoot });
    buildApp({ ...options, clientRoot, outputRoot });
    createFileSyncEndpoint({ ...options, clientRoot, outputRoot });
    createEndpoints({ ...options, clientRoot, outputRoot });

    const validation = verifyGeneratedApp({ ...options, clientRoot, outputRoot });
    return {
        outputRoot,
        appPath: path.join(outputRoot, "app.js"),
        validation
    };
}

export default { build };
