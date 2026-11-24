import path from "node:path";
import { createFolders } from "json-api-builder-create-folders";
import { createFiles } from "json-api-builder-create-files";
import * as insertModule from "json-api-builder-insert-content";
import * as alterModule from "json-api-builder-alter-content";
import * as createAppModule from "json-api-builder-create-app";
import * as endpointsModule from "json-api-builder-create-endpoints";
import { validateConfiguration, verifyGeneratedApp } from "json-api-builder-validation";

const insertContent = insertModule.v2?.insertContent ?? insertModule.insertContent;
const hookRoutes = alterModule.v2?.hookRoutes ?? alterModule.hookRoutes;
const buildApp = createAppModule.v2?.buildApp ?? createAppModule.buildApp;
const createEndpoints = endpointsModule.v2?.createEndpoints ?? endpointsModule.createEndpoints;
const createFileSyncEndpoint = endpointsModule.v2?.createFileSyncEndpoint ?? endpointsModule.createFileSyncEndpoint;

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
