import { Command } from 'commander';
import { handleNamedType, handleTypeLegacy } from './typeHelpers';
import { Interface as ReadlineInterface } from 'readline';
import { GenerateOptions } from '../../../utils/ai/generateAIHelper';

export function registerGenerateType(generate: Command, rl: ReadlineInterface) {
  generate
    .command('type [name] [folder]')
    .description('Generate TypeScript types (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for type and folder selection')
    .option('--replace', 'Replace file if it exists')
    .option('--ai', 'Use AI to generate the type code')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      await handleTypeLegacy(name, folder, options, rl);
    });

  generate
    .command('enum [name] [folder]')
    .description('Generate a TypeScript enum (optionally in a specific folder under app/)')
    .option('-i, --interactive', 'Use interactive mode for enum and folder selection')
    .option('--replace', 'Replace file if it exists')
    .option('--ai', 'Use AI to generate the enum code')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      await handleNamedType('enum', name, folder, options, rl);
    });

  generate
    .command('interface [name] [folder]')
    .description('Generate a TypeScript interface (optionally in a specific folder under app/)')
    .option('-i, --interactive', 'Use interactive mode for interface and folder selection')
    .option('--replace', 'Replace file if it exists')
    .option('--ai', 'Use AI to generate the interface code')
      .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      await handleNamedType('interface', name, folder, options, rl);
    });

  generate
    .command('class [name] [folder]')
    .description('Generate a TypeScript class (optionally in a specific folder under app/)')
    .option('-i, --interactive', 'Use interactive mode for class and folder selection')
    .option('--replace', 'Replace file if it exists')
    .option('--ai', 'Use AI to generate the class code')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      await handleNamedType('class', name, folder, options, rl);
    });
} 