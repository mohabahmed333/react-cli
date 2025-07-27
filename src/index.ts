#!/usr/bin/env node
import { handleA11yScan } from './commands/a11yScan';
import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { handleGlobal } from './commands/global';
import { handleConfig, handleInit } from './commands/config';
import { handleHelp } from './commands/help';
import { handleDeps } from './commands/deps';
import { handleGenerate } from './commands/generate';
import { handleBundleCheck } from './commands/bundleCheck';
import { handleLibraries } from './commands/libraries';
 import { registerDocsCommand } from './commands/docs';
import { setupAICommands } from './commands/ai';
import { registerOperation } from './operations/Operation';

const program = new Command();

// Create a single readline interface
const rl = readline.createInterface({ 
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
handleLibraries(program, rl);
handleGlobal(program, rl);
handleConfig(program, rl);
handleInit(program, rl);
handleHelp(program, rl);
handleDeps(program, rl);
handleGenerate(program, rl);
// handleBundleCheck(program, rl);
registerOperation(program, rl);
registerDocsCommand(program, rl);
setupAICommands(program, rl); // Update this to accept rl

// Parse arguments
program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err);
  cleanup();
});
