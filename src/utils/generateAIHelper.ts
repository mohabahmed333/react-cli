import type { CLIConfig } from './config';
import chalk from 'chalk';
import { askQuestion } from './prompt';
import readline from 'readline';

export interface GenerateOptions {
  name: string;
  useTS?: boolean;
  interactive?: boolean;
  ai?: boolean;
  useAI?: boolean;
  aiFeatures?: string;
  features?: string;
  css?: boolean;
  components?: boolean;
  lib?: boolean;
  layout?: boolean;           
  sidebar?: boolean;
  navbar?: boolean;
  props?: string;
  replace?: boolean;
  test?: boolean;
  rl?: readline.Interface;
  types?:boolean;
  utils?:boolean;
  context?:boolean;
  redux?:boolean;
  hooks?:boolean;
}

export interface GenerateAIOptions {
  features?: string;
  css?: boolean;
  components?: boolean;
  lib?: boolean;
  sidebar?: boolean;
  navbar?: boolean;
  props?: string;
}

export async function shouldUseAI(rl: readline.Interface, options: GenerateOptions, config: CLIConfig): Promise<boolean> {
  if (options.interactive) {
    return (await askQuestion(rl, chalk.blue('Use AI to generate code? (y/n): '))) === 'y';
  }
  return options.ai === true;
}

export async function getAIFeatures(rl: readline.Interface, type: string): Promise<string> {
  console.log(chalk.cyan(`\n🤖 AI Feature Specification for ${type}`));
  console.log(chalk.dim('Describe the features you want to include (press Enter to skip):'));
  return askQuestion(rl, chalk.blue('Features: '));
}

export async function confirmAIOutput(rl: readline.Interface, code: string): Promise<boolean> {
  console.log(chalk.cyan('\n📝 Generated Code Preview:'));
  console.log(chalk.dim('-------------------'));
  console.log(chalk.white(code.slice(0, 300) + (code.length > 300 ? '...' : '')));
  console.log(chalk.dim('-------------------'));

  const confirm = await askQuestion(rl, chalk.blue('Use this generated code? (y/n): '));
  return confirm.toLowerCase() === 'y';
}
