import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../utils/config';
import readline from 'readline';
import { generateDocumentation } from '../features/generateDocumentation';

export function registerDocsCommand(program: Command, rl: readline.Interface) {
  program
    .command('docs')
    .description('Generate documentation for components, hooks and types')
    .option('--storybook', 'Generate Storybook stories')
    .option('--md', 'Generate markdown documentation')
    .option('--all', 'Generate all documentation types')
    .option('-o, --output <path>', 'Output directory for docs')
    .action(async (options) => {
      const config = await setupConfiguration(rl);
      await generateDocumentation(options, config);
    });
} 