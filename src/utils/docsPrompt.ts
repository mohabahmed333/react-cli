import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { askQuestion } from './prompt';
import readline from 'readline';

interface DocOptions {
  ai: boolean;
  storybook: boolean;
  md: boolean;
  all: boolean;
  file?: string;
  force: boolean;
  output?: string;
}

export async function promptForDocOptions(rl: readline.Interface, config: any): Promise<DocOptions> {
  console.log(chalk.cyan('\n📝 Interactive Documentation Setup'));
  
  // Ask for AI usage
  const useAI = (await askQuestion(rl, chalk.blue('Use AI-powered documentation? (y/n): '))) === 'y';
  
  // Ask for documentation type
  console.log(chalk.cyan('\nDocumentation Types:'));
  console.log('1. Storybook stories');
  console.log('2. Markdown documentation');
  console.log('3. Both');
  const typeChoice = await askQuestion(rl, chalk.blue('Choose type (1-3): '));
  
  const options: DocOptions = {
    ai: useAI,
    storybook: typeChoice === '1' || typeChoice === '3',
    md: typeChoice === '2' || typeChoice === '3',
    all: typeChoice === '3',
    force: false
  };

  // Ask for specific file or all files
  const fileChoice = await askQuestion(rl, chalk.blue('Generate for specific file? (y/n): '));
  
  if (fileChoice === 'y') {
    // Show available files
    console.log(chalk.cyan('\nAvailable Files:'));
    const files: string[] = [];
    
    // List components
    const componentsPath = path.join(config.baseDir, 'components');
    if (fs.existsSync(componentsPath)) {
      const componentFiles = fs.readdirSync(componentsPath)
        .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));
      if (componentFiles.length > 0) {
        console.log(chalk.yellow('\nComponents:'));
        componentFiles.forEach((file, i) => {
          files.push(path.join(componentsPath, file));
          console.log(`${i + 1}. ${file}`);
        });
      }
    }

    // List hooks
    const hooksPath = path.join(config.baseDir, 'hooks');
    if (fs.existsSync(hooksPath)) {
      const hookFiles = fs.readdirSync(hooksPath)
        .filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      if (hookFiles.length > 0) {
        console.log(chalk.yellow('\nHooks:'));
        hookFiles.forEach((file, i) => {
          files.push(path.join(hooksPath, file));
          console.log(`${files.length}. ${file}`);
        });
      }
    }

    if (files.length === 0) {
      console.log(chalk.red('No eligible files found.'));
      return options;
    }

    const fileIndex = parseInt(await askQuestion(rl, chalk.blue(`Choose file (1-${files.length}): `))) - 1;
    if (fileIndex >= 0 && fileIndex < files.length) {
      options.file = files[fileIndex];
    }
  }

  // Ask about overwriting existing docs
  const shouldForce = await askQuestion(rl, chalk.blue('Overwrite existing documentation? (y/n): '));
  options.force = shouldForce === 'y';

  // Ask for custom output directory
  const customOutput = await askQuestion(rl, chalk.blue('Custom output directory (leave empty for default): '));
  if (customOutput) {
    options.output = customOutput;
  }

  // Show summary
  console.log(chalk.cyan('\n📋 Documentation Setup Summary:'));
  console.log(`AI-Powered: ${options.ai ? chalk.green('Yes') : chalk.yellow('No')}`);
  console.log(`Types: ${options.all ? chalk.green('Both') : 
              options.storybook ? chalk.green('Storybook') : 
              chalk.green('Markdown')}`);
  console.log(`Target: ${options.file ? chalk.green(path.basename(options.file)) : chalk.green('All Files')}`);
  console.log(`Overwrite: ${options.force ? chalk.green('Yes') : chalk.yellow('No')}`);
  console.log(`Output: ${options.output ? chalk.green(options.output) : chalk.green('Default')}`);

  const confirm = await askQuestion(rl, chalk.blue('\nProceed with documentation generation? (y/n): '));
  if (confirm !== 'y') {
    throw new Error('Documentation generation cancelled');
  }

  return options;
} 