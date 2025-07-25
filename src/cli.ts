#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { registerDocsCommand } from './commands/docs';
 
const program = new Command();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Rest of the file content remains the same, just converting to TypeScript...

registerDocsCommand(program, rl);
