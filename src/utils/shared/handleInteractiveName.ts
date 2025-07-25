// utils/generate-utils.ts
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { askQuestion } from '../prompt';
import { TReadlineInterface } from '../../types/ReadLineInterface';
import { GeneratorType } from '../../types/generator-type';

interface HandleInteractiveNameOptions {
  pattern?: RegExp;
  patternError?: string;
  skipValidation?: boolean;
  defaultValue?: string;
}

export async function handleInteractiveName(
  rl: TReadlineInterface,
  name: string | undefined,
  type: GeneratorType,
  options: HandleInteractiveNameOptions = {}
): Promise<string> {
  // Return immediately if name is provided and validation is skipped
  if (name && options.skipValidation) {
    return name;
  }

  // Get input if name isn't provided
  let input = name;
  if (!input) {
    const promptMessage = chalk.blue(
      `Enter ${type} name${options.patternError ? ` (${options.patternError})` : ''}: `
    );
    input = (await askQuestion(rl, promptMessage)) || options.defaultValue || '';
  }

  // Validate input if pattern is provided
  if (options.pattern && input && !options.pattern.test(input)) {
    const errorMessage = options.patternError || 
      `❌ Invalid ${type} name format. Expected pattern: ${options.pattern}`;
    console.log(chalk.red(errorMessage));
    rl.close();
    process.exit(1);
  }

  // Ensure we have a valid name
  if (!input) {
    console.log(chalk.red(`❌ ${type} name is required`));
    rl.close();
    process.exit(1);
  }

  return input;
}