import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import readline from 'readline';
import { setupConfiguration } from '../utils/config';
// Register all generate subcommands from their own files
import { registerGenerateGuard } from './generateGuard';
import { registerGenerateLayout } from './generateLayout';
import { registerGenerateHoc } from './generateHoc';
import { registerGenerateRoutes } from './generateRoutes';
import { registerGenerateServiceWorker } from './generateServiceWorker';
import { registerGenerateEnv } from './generateEnv';
import { registerGenerateTestUtils } from './generateTestUtils';
import { registerGenerateErrorBoundary } from './generateErrorBoundary';

export function handleGenerate(program: Command, rl: readline.Interface) {
  const generate = program.command('g').description('Generators for common React patterns');
  registerGenerateGuard(generate, rl);
  registerGenerateLayout(generate, rl);
  registerGenerateHoc(generate, rl);
  registerGenerateRoutes(generate, rl);
  registerGenerateServiceWorker(generate, rl);
  registerGenerateEnv(generate, rl);
  registerGenerateTestUtils(generate, rl);
  registerGenerateErrorBoundary(generate, rl);
}
