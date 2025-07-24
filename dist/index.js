#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const a11yScan_1 = require("./commands/a11yScan");
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const readline_1 = __importDefault(require("readline"));
const global_1 = require("./commands/global");
const config_1 = require("./commands/config");
const help_1 = require("./commands/help");
const deps_1 = require("./commands/deps");
const generate_1 = require("./commands/generate");
const bundleCheck_1 = require("./commands/bundleCheck");
const libraries_1 = require("./commands/libraries");
const program = new commander_1.Command();
const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
(0, a11yScan_1.handleA11yScan)(program, rl);
(0, libraries_1.handleLibraries)(program, rl);
(0, global_1.handleGlobal)(program, rl);
(0, config_1.handleConfig)(program, rl);
(0, config_1.handleInit)(program, rl);
(0, help_1.handleHelp)(program, rl);
// handleService(program, rl);
// handleContext(program, rl);
// handleRedux(program, rl);
(0, deps_1.handleDeps)(program, rl);
(0, generate_1.handleGenerate)(program, rl);
(0, bundleCheck_1.handleBundleCheck)(program, rl);
program.parseAsync(process.argv).catch((err) => {
    console.error(chalk_1.default.red('Error:'), err);
    rl.close();
    process.exit(1);
});
