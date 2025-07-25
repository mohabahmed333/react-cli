import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import readline from 'readline';
 
import { registerGenerateUtil } from './generateUtil';
import { registerGeneratePage } from './generatePage';
import { registerGenerateType } from './generateType';
import { registerGenerateRedux } from './generateRedux';
import { registerGenerateService } from './generateService';
import { registerGenerateServiceWorker } from './generateServiceWorker';
import { registerGenerateRoutes } from './generateRoutes';
import { registerGenerateHook } from './generateHook';
import { registerGenerateComponent } from './generateComponent';
import { registerGenerateErrorBoundary } from './generateErrorBoundary';
import { registerGenerateTestUtils } from './generateTestUtils';
import { registerGenerateEnv } from './generateEnv';
import { registerGenerateHoc } from './generateHoc';
import { registerGenerateLayout } from './generateLayout';
import { registerGenerateGuard } from './generateGuard';
 
 
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
  registerGenerateComponent(generate, rl);
  registerGenerateHook(generate, rl);
  registerGenerateUtil(generate, rl);
  registerGenerateType(generate, rl);
  registerGeneratePage(generate, rl);
  // registerGenerateContext(generate, rl);
  registerGenerateRedux(generate, rl);
  registerGenerateService(generate, rl);
}
