#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { registerDocsCommand } from './commands/docs';
import { registerAuditCommand } from './commands/audit';
import { handleGenerate } from './commands/generate';
import { registerAIAgentCommand } from './commands/aiAgent';
import { registerSmartCommand } from './commands/smartCommands';
import { createAITemplateCommand } from './commands/aiTemplate';
import { registerTemplateCommands } from './commands/template';
 
const program = new Command();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Register commands
registerDocsCommand(program, rl);
registerAuditCommand(program, rl);
handleGenerate(program, rl);
registerAIAgentCommand(program, rl);
registerSmartCommand(program, rl);
registerTemplateCommands(program, rl);
program.addCommand(createAITemplateCommand());

// Parse CLI arguments
program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err);
  rl.close();
  process.exit(1);
});
