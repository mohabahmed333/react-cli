"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGenerate = handleGenerate;
// Register all generate subcommands from their own files
const generateGuard_1 = require("./generateGuard");
const generateLayout_1 = require("./generateLayout");
const generateHoc_1 = require("./generateHoc");
const generateRoutes_1 = require("./generateRoutes");
const generateServiceWorker_1 = require("./generateServiceWorker");
const generateEnv_1 = require("./generateEnv");
const generateTestUtils_1 = require("./generateTestUtils");
const generateErrorBoundary_1 = require("./generateErrorBoundary");
function handleGenerate(program, rl) {
    const generate = program.command('g').description('Generators for common React patterns');
    (0, generateGuard_1.registerGenerateGuard)(generate, rl);
    (0, generateLayout_1.registerGenerateLayout)(generate, rl);
    (0, generateHoc_1.registerGenerateHoc)(generate, rl);
    (0, generateRoutes_1.registerGenerateRoutes)(generate, rl);
    (0, generateServiceWorker_1.registerGenerateServiceWorker)(generate, rl);
    (0, generateEnv_1.registerGenerateEnv)(generate, rl);
    (0, generateTestUtils_1.registerGenerateTestUtils)(generate, rl);
    (0, generateErrorBoundary_1.registerGenerateErrorBoundary)(generate, rl);
}
