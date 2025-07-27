import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../utils/config';
import readline from 'readline';
import { generateDocumentation } from './docs/generateDocumentation';
import { generateAIDocumentation } from './docs/generateAIDocs';
import { promptForDocOptions } from '../utils/docsPrompt';

export function registerDocsCommand(program: Command, rl: readline.Interface) {
  program
    .command('docs')
    .description('Generate documentation for components, hooks and types')
    .option('--storybook', 'Generate Storybook stories')
    .option('--md', 'Generate markdown documentation')
    .option('--all', 'Generate all documentation types')
    .option('-o, --output <path>', 'Output directory for docs')
    .option('--ai', 'Use AI to generate enhanced documentation')
    .option('-f, --file <path>', 'Generate documentation for a specific file')
    .option('--force', 'Force regeneration of existing documentation')
    .option('-i, --interactive', 'Use interactive mode for documentation setup')
    .action(async (options) => {
      try {
        const config = await setupConfiguration(rl);

        // If interactive mode is enabled, get options through prompts
        if (options.interactive) {
          const interactiveOptions = await promptForDocOptions(rl, config);
          options = { ...options, ...interactiveOptions };
        }
        
        if (options.ai) {
          if (!config.aiEnabled) {
            console.log(chalk.yellow('AI features are not enabled. Run "yarn re ai enable" to enable them.'));
            return;
          }

          // If no format is specified but file is provided, default to both formats
          if (options.file && !options.storybook && !options.md && !options.all) {
            options.all = true;
          }

          await generateAIDocumentation(options, config);
        } else {
          await generateDocumentation(options, config);
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Documentation generation cancelled') {
          console.log(chalk.yellow('\n⏹️ Documentation generation cancelled'));
        } else {
          console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
        }
      }
    });
} 