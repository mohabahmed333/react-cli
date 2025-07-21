#!/usr/bin/env node
import { handleA11yScan } from './commands/a11yScan';
import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { handleHook } from './commands/hook';
import { handleUtil } from './commands/util';
import { handleType } from './commands/type';
import { handleGlobal } from './commands/global';
import { handlePage } from './commands/page';
import { handleConfig, handleInit } from './commands/config';
import { handleHelp } from './commands/help';
import { handleService } from './commands/service';
import { handleContext } from './commands/context';
import { handleRedux } from './commands/redux';
import { handleDeps } from './commands/deps';
import { handleGenerate } from './commands/generate';
import { handleBundleCheck } from './commands/bundleCheck';
import { handleLibraries } from './commands/libraries';


const program = new Command();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

handleA11yScan(program, rl);
handleLibraries(program, rl);

handleHook(program, rl);
handleUtil(program, rl);
handleType(program, rl);
handleGlobal(program, rl);
handlePage(program, rl);

handleConfig(program, rl);
handleInit(program, rl);
handleHelp(program, rl);
handleService(program, rl);
handleContext(program, rl);
handleRedux(program, rl);
handleDeps(program, rl);
handleGenerate(program, rl);
handleBundleCheck(program, rl);

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err);
  rl.close();
  process.exit(1);
});
