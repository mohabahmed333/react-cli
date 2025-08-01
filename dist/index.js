#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const global_1 = require("./commands/global");
const config_1 = require("./commands/config");
const help_1 = require("./commands/help");
const deps_1 = require("./commands/deps");
const generate_1 = require("./commands/generate");
const libraries_1 = require("./commands/libraries");
const docs_1 = require("./commands/docs");
const ai_1 = require("./commands/ai");
const Operation_1 = require("./operations/Operation");
const template_1 = require("./commands/template");
const CommandRegistrar_1 = require("./services/CommandRegistrar");
const InteractiveMenu_1 = require("./services/InteractiveMenu");
const add_1 = require("./commands/add");
const program = new commander_1.Command();
// Create a single readline interface
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});
// Handle cleanup
const cleanup = () => {
    rl.close();
    process.exit(0);
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
// Register commands with the same readline interface
// handleA11yScan(program, rl);
(0, libraries_1.handleLibraries)(program, rl);
(0, global_1.handleGlobal)(program, rl);
(0, config_1.handleConfig)(program, rl);
(0, config_1.handleInit)(program, rl);
(0, help_1.handleHelp)(program, rl);
(0, deps_1.handleDeps)(program, rl);
(0, generate_1.handleGenerate)(program, rl);
// handleBundleCheck(program, rl);
(0, Operation_1.registerOperation)(program, rl);
(0, docs_1.registerDocsCommand)(program, rl);
(0, ai_1.setupAICommands)(program, rl); // Update this to accept rl
(0, template_1.registerTemplateCommands)(program, rl);
(0, add_1.registerAddCommand)(program, rl); // Add the new add command
// Register commands with interactive system
CommandRegistrar_1.CommandRegistrar.registerMainCommands(program, rl);
// Check if any arguments are provided beyond node and script name
const hasArguments = process.argv.length > 2;
if (!hasArguments) {
    // No arguments provided - show interactive menu
    console.log(chalk_1.default.cyan('🚀 Starting Interactive Mode...'));
    console.log(chalk_1.default.gray('Tip: You can still use traditional commands like "npm run re help" or "yarn re libraries"\n'));
    // Start interactive menu
    InteractiveMenu_1.interactiveMenu.showMainMenu().catch((err) => {
        console.error(chalk_1.default.red('Error in interactive mode:'), err);
        cleanup();
    });
}
else {
    // Arguments provided - use traditional CLI parsing
    program.parseAsync(process.argv).catch((err) => {
        console.error(chalk_1.default.red('Error:'), err);
        cleanup();
    });
}
