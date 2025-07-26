import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';
import { GenerateOptions } from '../../utils/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';

interface TestUtilsOptions extends GenerateOptions {
  replace?: boolean;
  interactive?: boolean;
  ai?: boolean;
}

export function registerGenerateTestUtils(generate: Command, rl: ReadlineInterface) {
  generate
    .command('test-utils')
    .description('Create test utilities for React Testing Library')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode')
    .option('--ai', 'Use AI to generate the test utilities code')
    .action(async (options: TestUtilsOptions) => {
      try {
        console.log(chalk.cyan('\n🧪 Test Utilities Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const useTS = config.typescript;
        const targetDir = path.join(config.baseDir, 'test-utils');
        const fileName = 'test-utils';

        // Handle interactive options
        if (options.interactive && config.aiEnabled) {
          options.ai = (await askQuestion(
            rl,
            chalk.blue('Use AI to generate code? (y/n): ')
          )) === 'y';

          if (options.ai) {
            options.aiFeatures = await askQuestion(
              rl,
              chalk.blue('Describe additional features (e.g., "mock providers, custom queries, test data generators"): ')
            );
          }
        }

        const defaultContent = generateTestUtilsContent(useTS);

        await createGeneratedFile({
          rl,
          config,
          type: 'test-utils',
          name: fileName,
          targetDir,
          useTS,
          replace: options.replace ?? false,
          defaultContent,
          aiOptions: options.ai ? {
            features: options.aiFeatures,
            additionalPrompt: generateAIPrompt()
          } : undefined
        });

        console.log(chalk.green(`✅ Successfully generated test utilities`));
      } catch (error) {
        console.error(chalk.red('❌ Error generating test utilities:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}

function generateTestUtilsContent(useTS: boolean): string {
  return `// Test utilities
import { render } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

export const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
// export * from '@testing-library/react';
`;
}

function generateAIPrompt(): string {
  return `Create comprehensive test utilities for React Testing Library including:
- Custom render function with common providers
- Mock providers for common contexts
- Custom queries
- Test data generators
- Utility functions for common testing patterns
- TypeScript support if needed`;
}