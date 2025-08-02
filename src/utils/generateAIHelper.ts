import { generateWithAI } from '../services/ai-service';
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

export async function     generateComponentWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a React ${config.typescript ? 'TypeScript' : 'JavaScript'} component named ${name}.
    Requirements:
    - Use functional component
    - Include proper props interface/type
    - Add JSDoc comments
    - Follow React best practices
    - Include basic styling
    ${options.props ? `- Include these props: ${options.props}` : ''}
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    Output ONLY the component code:`;

  return generateWithAI(prompt, config);
}

export async function generateHookWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a React ${config.typescript ? 'TypeScript' : 'JavaScript'} hook named ${name}.
    Requirements:
    - Follow React Hooks best practices
    - Include proper TypeScript types
    - Add JSDoc comments
    - Handle cleanup if needed
    - Include error handling
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    Output ONLY the hook code:`;

  return generateWithAI(prompt, config);
}

export async function generateServiceWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a ${config.typescript ? 'TypeScript' : 'JavaScript'} service named ${name}.
    Requirements:
    - Include proper types/interfaces
    - Add error handling
    - Add JSDoc comments
    - Follow best practices
    - Include API integration patterns
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    Output ONLY the service code:`;

  return generateWithAI(prompt, config);
}

export async function generateTypeWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate TypeScript types/interfaces named ${name}.
    Requirements:
    - Include comprehensive type definitions
    - Add JSDoc comments
    - Use TypeScript best practices
    - Include examples in comments
    ${options.features ? `- Include these fields/types: ${options.features}` : ''}
    Output ONLY the type definitions:`;

  return generateWithAI(prompt, config);
}

export async function generateUtilWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a ${config.typescript ? 'TypeScript' : 'JavaScript'} utility function named ${name}.
    Requirements:
    - Include proper types
    - Add JSDoc comments
    - Include error handling
    - Add input validation
    - Follow functional programming principles
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    Output ONLY the utility code:`;

  return generateWithAI(prompt, config);
}

export async function generateContextWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a React ${config.typescript ? 'TypeScript' : 'JavaScript'} context named ${name}.
    Requirements:
    - Include provider component
    - Add proper types
    - Include custom hooks for context usage
    - Add JSDoc comments
    - Follow React context best practices
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    Output ONLY the context code:`;

  return generateWithAI(prompt, config);
}

export async function generateReduxWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a Redux Toolkit slice named ${name} in ${config.typescript ? 'TypeScript' : 'JavaScript'}.
    Requirements:
    - Include proper state interface/type
    - Add action creators and reducers
    - Include proper TypeScript types for actions
    - Add JSDoc comments
    - Follow Redux best practices
    - Include selectors if needed
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    Output ONLY the Redux slice code:`;

  return generateWithAI(prompt, config);
}

export async function generatePageWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a React ${config.typescript ? 'TypeScript' : 'JavaScript'} page component named ${name}.
    Requirements:
    - Use functional component
    - Include proper props interface/type
    - Add JSDoc comments
    - Follow React best practices
    - Include routing setup if needed
    - Include basic layout structure
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    ${options.css ? '- Include CSS module styling' : ''}
    ${options.components ? '- Include sample child components' : ''}
    ${options.lib ? '- Include constants and utility functions' : ''}
    Output ONLY the page component code:`;

  return generateWithAI(prompt, config);
}

export async function generateLayoutWithAI(name: string, config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate a React ${config.typescript ? 'TypeScript' : 'JavaScript'} layout component named ${name}Layout.
    Requirements:
    - Use functional component
    - Include proper props interface/type
    - Add JSDoc comments
    - Follow React best practices
    - Include nested routing support
    - Include responsive layout structure
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    ${options.sidebar ? '- Include sidebar component and logic' : ''}
    ${options.navbar ? '- Include navbar component and logic' : ''}
    Output ONLY the layout component code:`;

  return generateWithAI(prompt, config);
}

export async function generateTestUtilsWithAI(config: CLIConfig, options: GenerateAIOptions): Promise<string | null> {
  const prompt = `Generate React Testing Library utilities in ${config.typescript ? 'TypeScript' : 'JavaScript'}.
    Requirements:
    - Include custom render function
    - Add common test helpers and mocks
    - Include proper types and interfaces
    - Add JSDoc comments
    - Follow testing best practices
    - Include provider wrappers
    ${options.features ? `- Implement these features: ${options.features}` : ''}
    Output ONLY the test utilities code:`;

  return generateWithAI(prompt, config);
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
