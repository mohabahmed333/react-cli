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
import { registerAIConfigCommands } from './commands/aiConfig';
import { shouldRegisterAICommands } from './libraryConfig.ts/libraryConfig';
import { registerOperation } from './operations/Operation';
import { registerTemplateCommands } from './commands/template';
import { CommandRegistrar } from './services/commandRegistar/CommandRegistrar';
import { interactiveMenu } from './services/InteractiveMenu';
import { registerAddCommand } from './commands/add';
import { registerMistralCommand } from './commands/mistral';

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

// Only register AI commands if enabled at library level
if (shouldRegisterAICommands()) {
  setupAICommands(program, rl); // Update this to accept rl
  registerAIConfigCommands(program, rl); // Add AI configuration commands
}

registerTemplateCommands(program, rl);
registerAddCommand(program, rl); // Add the new add command
registerMistralCommand(program, rl); // Add Mistral AI command

// Register commands with interactive system
CommandRegistrar.registerMainCommands(program, rl);

// Check if any arguments are provided beyond node and script name
const hasArguments = process.argv.length > 2;

if (!hasArguments) {
  // No arguments provided - show interactive menu
  console.log(chalk.cyan('🚀 Starting Interactive Mode...'));
  console.log(chalk.gray('Tip: You can still use traditional commands like "npm run re help" or "yarn re libraries"\n'));
  
  // Start interactive menu
  interactiveMenu.showMainMenu().catch((err) => {
    console.error(chalk.red('Error in interactive mode:'), err);
    cleanup();
  });
} else {
  // Arguments provided - use traditional CLI parsing
  program.parseAsync(process.argv).catch((err) => {
    console.error(chalk.red('Error:'), err);
    cleanup();
  });
}
