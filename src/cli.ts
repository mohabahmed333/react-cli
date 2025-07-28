#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { registerDocsCommand } from './commands/docs';
import { registerAuditCommand } from './commands/audit';
 
const program = new Command();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Register commands
registerDocsCommand(program, rl);
registerAuditCommand(program, rl);

// Parse CLI arguments
program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err);
  rl.close();
  process.exit(1);
});
