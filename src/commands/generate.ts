import { Command } from 'commander';
import readline from 'readline';
import { registerGenerateGuard } from './generate/generateGuard';
import { registerGenerateHoc } from './generate/generateHoc';
import { registerGenerateRoutes } from './generate/generateRoutes';
import { registerGenerateServiceWorker } from './generate/generateServiceWorker';
import { registerGenerateEnv } from './generate/generateEnv';
import { registerGenerateTestUtils } from './generate/generateTestUtils';
import { registerGenerateErrorBoundary } from './generate/generateErrorBoundary';
import { registerGenerateComponent } from './generate/component/generateComponent';
import { registerGenerateHook } from './generate/generateHook';
import { registerGenerateUtil } from './generate/generateUtil';
import { registerGenerateType } from './generate/type/generateType';
  import { registerGenerateRedux } from './generate/generateRedux';
import { registerGenerateService } from './generate/generateService';
import { registerGeneratePage } from './generate/page/generatePage';
import { registerGenerateContext } from './generate/generateContext';

 
export function handleGenerate(program: Command, rl: readline.Interface) {
  const generate = program.command('g').description('Generators for common React patterns');
 
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
  registerGenerateGuard(generate, rl);
}
