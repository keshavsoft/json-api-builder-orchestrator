import path from "node:path";
import {
    createFolders
} from "@keshavsoft/json-api-builder-create-folders";
import {
    createFiles
} from "@keshavsoft/json-api-builder-create-files";
import {
    insertContent
} from "@keshavsoft/json-api-builder-insert-content";
import {
    hookRoutes
} from "@keshavsoft/json-api-builder-alter-content";
import {
    createApp,
    hookAppStrategies
} from "@keshavsoft/json-api-builder-create-app";
import {
    createEndpoints,
    createFileSyncEndpoint
} from "@keshavsoft/json-api-builder-create-endpoints";
import {
    validateConfiguration,
    verifyGeneratedApp
} from "@keshavsoft/json-api-builder-validation";

export function build(options = {}) {
    const clientRoot = path.resolve(options.clientRoot ?? process.cwd());
    const outputRoot = path.resolve(options.outputRoot ?? path.join(clientRoot, "output"));

    validateConfiguration({ ...options, clientRoot });
    createFolders({ ...options, clientRoot, outputRoot });
    createFiles({ ...options, clientRoot, outputRoot });
    insertContent({ ...options, clientRoot, outputRoot });
    hookRoutes({ ...options, clientRoot, outputRoot });
    createApp({ ...options, clientRoot, outputRoot });
    createFileSyncEndpoint({ ...options, clientRoot, outputRoot });
    createEndpoints({ ...options, clientRoot, outputRoot });
    hookAppStrategies({ ...options, clientRoot, outputRoot });

    const validation = verifyGeneratedApp({ ...options, clientRoot, outputRoot });
    return {
        outputRoot,
        appPath: path.join(outputRoot, "app.js"),
        validation
    };
}

export default { build };
