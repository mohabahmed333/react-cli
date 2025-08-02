import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../../utils/config/config';
import { handleInteractiveName } from '../../utils/shared/handleInteractiveName';
import { handleTargetDirectory } from '../../utils/createGeneratedFile/handleTargetDirectory';
import { createGeneratedFile } from '../../utils/createGeneratedFile/createGeneratedFile';
import { createAIOptions } from '../../utils/shared/generateWithAiHelper';
import { GenerateOptions } from '../../utils/ai/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateUtil(generate: Command, rl: ReadlineInterface) {
  generate
    .command('util [name] [folder]')
    .description('Generate a utility function (optionally in a specific folder)')
    .option('--ts', 'Override TypeScript setting')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode for util and folder selection')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = options.useTS ?? config.typescript;

        const utilName = await handleInteractiveName(
          rl,
          name,
          'service', // Using 'service' as fallback since there's no 'utils' type
          {
            pattern: /^[a-z][a-zA-Z0-9]*$/,
            patternError: "❌ Util name must be camelCase and start with a lowercase letter"
          }
        );

        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'utils',
          options.interactive ?? false
        );

        const defaultContent = generateUtilContent(utilName, useTS);

        await createGeneratedFile({
          rl,
          config,
          type: 'service', // Using 'service' as fallback
          name: utilName,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: createAIOptions(utilName, 'service', useTS)
        });
      } catch (error) {
        console.error(chalk.red('❌ Error generating util:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}

function generateUtilContent(name: string, useTS: boolean): string {
  if (useTS) {
    return `/**
 * ${name} utility functions
 */

export const ${name} = (input: string): string => {
  return input.toUpperCase();
};

export default ${name};
`;
  } else {
    return `/**
 * ${name} utility functions
 */

export const ${name} = (input) => {
  return input.toUpperCase();
};

export default ${name};
`;
  }
}