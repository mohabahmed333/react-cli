import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import readline from 'readline';
import { setupConfiguration } from '../utils/config';
import { registerGenerateGuard } from './generate/generateGuard';
import { registerGenerateLayout } from './generate/generateLayout';
import { registerGenerateHoc } from './generate/generateHoc';
import { registerGenerateRoutes } from './generate/generateRoutes';
import { registerGenerateServiceWorker } from './generate/generateServiceWorker';
import { registerGenerateEnv } from './generate/generateEnv';
import { registerGenerateTestUtils } from './generate/generateTestUtils';
import { registerGenerateErrorBoundary } from './generate/generateErrorBoundary';
import { registerGenerateComponent } from './generate/generateComponent';
import { registerGenerateHook } from './generate/generateHook';
import { registerGenerateUtil } from './generate/generateUtil';
import { registerGenerateType } from './generate/generateType';
import { registerGeneratePage } from './generate/generatePage';
import { registerGenerateContext } from './generate/generateContext';
import { registerGenerateRedux } from './generate/generateRedux';
import { registerGenerateService } from './generate/generateService';
 
 
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
  registerGenerateContext(generate, rl);
  registerGenerateRedux(generate, rl);
  registerGenerateService(generate, rl);
}
