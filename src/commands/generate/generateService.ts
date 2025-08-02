import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config/config';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { handleTargetDirectory } from '../../utils/createGeneratedFile/handleTargetDirectory';
import { createGeneratedFile } from '../../utils/createGeneratedFile/createGeneratedFile';
import { createServiceAIOptions } from '../../utils/shared/generateWithAiHelper';
import { GenerateOptions } from '../../utils/ai/generateAIHelper';
 import { Interface as ReadlineInterface } from 'readline';
import { generateServiceContent } from '../../content';

interface ServiceOptions extends GenerateOptions {
  crud?: boolean;
  api?: 'axios' | 'react-query' | 'rtk-query';
  errorHandler?: 'basic' | 'detailed' | 'toast';
  outputDir?: string;
  useAxios?: boolean;
  useCrud?: boolean;
}

export function registerGenerateService(generate: Command, rl: ReadlineInterface) {
  generate
    .command('service [name] [folder]')
    .description('Generate a new service (optionally in a specific folder)')
    .option('--crud', 'Generate CRUD operations')
    .option('--api <type>', 'API integration type (axios/react-query/rtk-query)')
    .option('--error-handler <type>', 'Error handling type (basic/detailed/toast)')
    .option('--replace', 'Replace existing files')
    .option('-i, --interactive', 'Use interactive mode for service and folder selection')
    .action(async (name: string | undefined, folder: string | undefined, options: ServiceOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = config.typescript;

        const serviceName = await handleInteractiveName(
          rl,
          name,
          'service',
          {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ Service name must be PascalCase and start with a capital letter"
          }
        );

        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'services',
          options.interactive ?? false
        );

        const defaultContent = generateServiceContent(serviceName, options, useTS);

        await createGeneratedFile({
          rl,
          config,
          type: 'service',
          name: `${serviceName}Service`,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: createServiceAIOptions(serviceName, useTS)
        });
      } catch (error) {
        console.error(chalk.red('❌ Error generating service:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}