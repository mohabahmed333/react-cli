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
import { registerOperation } from './commands/operations/Operation';
import { registerDocsCommand } from './commands/docs';


const program = new Command();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

handleA11yScan(program, rl);
handleLibraries(program, rl);

handleGlobal(program, rl);
handleConfig(program, rl);
handleInit(program, rl);
handleHelp(program, rl);
registerDocsCommand(program, rl);

handleDeps(program, rl);
handleGenerate(program, rl);
handleBundleCheck(program, rl);
registerOperation(program, rl);
program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err);
  rl.close();
  process.exit(1);
});
